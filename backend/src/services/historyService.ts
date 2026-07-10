import { assertDateString } from "../utils/date";
import { prisma } from "../utils/prisma";
import { dailyInclude } from "./dailyService";

export async function getHistory(userId: string, start: string, end: string) {
  assertDateString(start);
  assertDateString(end);

  return prisma.dailyEntry.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
      OR: [{ record: { not: "" } }, { plans: { some: {} } }]
    },
    include: dailyInclude,
    orderBy: { date: "desc" }
  });
}
