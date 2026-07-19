import { DailyEntryWithRelations, getRecentEntries } from "./dailyService";
import { getContext } from "./contextService";
import { recentDateRange } from "../utils/date";
import { prisma } from "../utils/prisma";

type ReportJson = {
  stateType: string;
  conclusion: string;
  surfaceReason: string;
  deepReason: string;
  suggestion: string;
};

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

function assertReportJson(value: unknown): ReportJson {
  if (!value || typeof value !== "object") {
    throw new Error("AI response is not a JSON object");
  }
  const candidate = value as Partial<Record<keyof ReportJson, unknown>>;
  const fields: (keyof ReportJson)[] = [
    "stateType",
    "conclusion",
    "surfaceReason",
    "deepReason",
    "suggestion"
  ];
  for (const field of fields) {
    if (typeof candidate[field] !== "string" || !candidate[field]?.trim()) {
      throw new Error(`AI response missing field: ${field}`);
    }
  }
  const report = candidate as ReportJson;
  return {
    stateType: report.stateType.trim(),
    conclusion: report.conclusion.trim(),
    surfaceReason: report.surfaceReason.trim(),
    deepReason: report.deepReason.trim(),
    suggestion: report.suggestion.trim()
  };
}

function buildPrompt(input: {
  date: string;
  entry: DailyEntryWithRelations;
  background: string;
  recentEntries: DailyEntryWithRelations[];
}) {
  const plans = input.entry.plans.map((plan) => ({
    content: plan.content,
    completed: plan.completed,
    note: plan.note
  }));
  const recent = input.recentEntries.map((item) => ({
    date: item.date,
    record: item.record,
    report: item.report
      ? {
          stateType: item.report.stateType,
          conclusion: item.report.conclusion,
          suggestion: item.report.suggestion
        }
      : null
  }));

  return [
    {
      role: "system",
      content: [
        "你是 DayMind 的今日洞察生成器。只返回严格 JSON，不要 Markdown，不要解释，也不要输出 schema 之外的字段。",
        "洞察必须直白、客观、克制、有判断力，但不能刺痛用户；不聊天、不安慰、不说教，不使用心理诊断式表达，不编造或过度推测用户没有提供的信息。",
        "计划备注记录了实际进度、遇到的情况或未完成原因。判断计划执行情况时必须结合备注，不能只根据 completed 的布尔值下结论。",
        "conclusion、surfaceReason 和 deepReason 是同一段洞察正文依次衔接的三个部分，必须前后连贯，拼接后应像一段完整自然的个人洞察，而不是三个独立回答。",
        "conclusion 用 1 至 2 句话概括今天的整体状态，约 30 至 60 字；surfaceReason 用 2 至 3 句话承接前文，说明今天实际发生的事情以及计划完成情况反映出的直接原因，约 60 至 120 字；deepReason 用 2 至 3 句话继续深入解释节奏、行动启动、注意力、任务阻力或近期状态变化，约 60 至 120 字。",
        "三个字段拼接后的正文通常控制在 150 至 260 字，不要为了凑字数重复信息或写空话。字段之间要有自然过渡，每个字段都直接续写正文。",
        "conclusion、surfaceReason 和 deepReason 的内容中禁止出现“核心结论”“原因分析”“表层原因”“底层原因”“表层”“深层”等标题、标签、编号或冒号式开头。",
        "如果用户提供的信息较少，正文应相应缩短并明确承认信息有限，不能强行写满字数，也不能擅自分析深层心理原因。",
        "明日建议只给 1 条，必须具体、克制且可执行。"
      ].join("\n")
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          task: "生成今日洞察",
          outputSchema: {
            stateType: "string",
            conclusion: "string",
            surfaceReason: "string",
            deepReason: "string",
            suggestion: "string"
          },
          priority: [
            "今日计划、计划备注和今日记录最高",
            "近期背景目标其次",
            "最近 7 天历史洞察再次",
            "最近 7 天原始记录作为辅助"
          ],
          writingRequirements: {
            continuity: "conclusion、surfaceReason、deepReason 按顺序拼接后必须是一段自然、完整、无重复的个人洞察",
            conclusion: "1 至 2 句话，约 30 至 60 字，概括今天的整体状态",
            surfaceReason: "2 至 3 句话，约 60 至 120 字，承接上文说明实际发生的事情和计划完成情况",
            deepReason: "2 至 3 句话，约 60 至 120 字，在前文基础上解释节奏、行动启动、注意力、任务阻力或近期变化",
            totalLength: "信息充分时合计约 150 至 260 字；信息较少时应缩短并承认信息有限",
            prohibited: "不得包含小标题、字段名称、编号、重复信息、心理诊断或无依据推测"
          },
          date: input.date,
          todayPlans: plans,
          todayRecord: input.entry.record,
          backgroundGoal: input.background,
          recentSevenDays: recent
        },
        null,
        2
      )
    }
  ];
}

export async function callDeepSeekReport(input: {
  date: string;
  entry: DailyEntryWithRelations;
  background: string;
  recentEntries: DailyEntryWithRelations[];
}) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("AI_API_KEY is missing");
  }

  const baseUrl = (process.env.AI_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "deepseek-v4-flash";
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: buildPrompt(input),
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek request failed: ${response.status} ${detail}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek response missing content");
  }

  try {
    const parsed = JSON.parse(extractJson(content));
    return { report: assertReportJson(parsed), raw: content };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    throw new Error(`Failed to parse AI JSON: ${message}`);
  }
}

export async function generateAndSaveReport(userId: string, entry: DailyEntryWithRelations) {
  const context = await getContext(userId);
  const recentDates = recentDateRange(entry.date, 7);
  const recentEntries = await getRecentEntries(userId, recentDates);
  const { report, raw } = await callDeepSeekReport({
    date: entry.date,
    entry,
    background: context.content,
    recentEntries
  });

  return prisma.dailyReport.upsert({
    where: { entryId: entry.id },
    update: {
      ...report,
      backgroundSnapshot: context.content,
      aiRawResponse: raw
    },
    create: {
      entryId: entry.id,
      ...report,
      backgroundSnapshot: context.content,
      aiRawResponse: raw
    }
  });
}
