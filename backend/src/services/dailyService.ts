import { Prisma } from "@prisma/client";
import { assertDateString } from "../utils/date";
import { prisma } from "../utils/prisma";

export const dailyInclude = {
  plans: { orderBy: { sortOrder: "asc" as const } },
  report: true
};

export async function ensureDailyEntry(userId: string, date: string) {
  assertDateString(date);
  return prisma.dailyEntry.upsert({
    where: { userId_date: { userId, date } },
    update: {},
    create: { userId, date, record: "" }
  });
}

export async function getDailyEntry(userId: string, date: string) {
  assertDateString(date);
  const entry = await prisma.dailyEntry.findUnique({
    where: { userId_date: { userId, date } },
    include: dailyInclude
  });

  return (
    entry || {
      id: null,
      userId,
      date,
      record: "",
      createdAt: null,
      updatedAt: null,
      plans: [],
      report: null
    }
  );
}

export async function updateRecord(userId: string, date: string, record: string) {
  assertDateString(date);
  return prisma.dailyEntry.upsert({
    where: { userId_date: { userId, date } },
    update: { record },
    create: { userId, date, record },
    include: dailyInclude
  });
}

export async function getEntryForReport(userId: string, date: string) {
  const entry = await ensureDailyEntry(userId, date);
  return prisma.dailyEntry.findUniqueOrThrow({
    where: { id: entry.id },
    include: dailyInclude
  });
}

export async function getRecentEntries(userId: string, dates: string[]) {
  return prisma.dailyEntry.findMany({
    where: { userId, date: { in: dates } },
    include: dailyInclude,
    orderBy: { date: "asc" }
  });
}

export type DailyEntryWithRelations = Prisma.DailyEntryGetPayload<{
  include: typeof dailyInclude;
}>;
