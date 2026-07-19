import { assertDateString } from "../utils/date";
import { prisma } from "../utils/prisma";
import { dailyInclude } from "./dailyService";

export async function getHistory(userId: string, start: string, end: string) {
  assertDateString(start);
  assertDateString(end);
  assertDateRange(start, end);

  return prisma.dailyEntry.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
      OR: [{ record: { not: "" } }, { plans: { some: {} } }, { report: { isNot: null } }]
    },
    include: dailyInclude,
    orderBy: { date: "desc" }
  });
}

export async function getHistorySummary(userId: string, start: string, end: string) {
  assertDateString(start);
  assertDateString(end);
  assertDateRange(start, end);

  const entries = await prisma.dailyEntry.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
      OR: [{ record: { not: "" } }, { plans: { some: {} } }, { report: { isNot: null } }]
    },
    select: {
      date: true,
      record: true,
      report: { select: { id: true } },
      _count: { select: { plans: true } }
    },
    orderBy: { date: "asc" }
  });

  return entries.map((entry) => ({
    date: entry.date,
    hasContent: Boolean(entry.record.trim() || entry._count.plans),
    hasReport: Boolean(entry.report),
    planCount: entry._count.plans
  }));
}

function assertDateRange(start: string, end: string) {
  if (start > end) {
    const error = new Error("start must be on or before end");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
}
