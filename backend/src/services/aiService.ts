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
    completed: plan.completed
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
      content:
        "你是 DayMind 的状态报告生成器。只返回严格 JSON，不要 Markdown，不要解释。报告必须短、准、有判断力，直白但不能刺痛用户。不做聊天，不安慰，不说教，不编造用户没有提供的信息。明日建议只给 1 条，必须具体可执行。如果今日记录为空，只能基于计划完成情况克制判断，必须承认信息有限，不能擅自分析深层心理原因。"
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          task: "生成今日状态报告",
          outputSchema: {
            stateType: "string",
            conclusion: "string",
            surfaceReason: "string",
            deepReason: "string",
            suggestion: "string"
          },
          priority: [
            "今日计划和今日记录最高",
            "近期背景目标其次",
            "最近 7 天状态报告再次",
            "最近 7 天原始记录作为辅助"
          ],
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
