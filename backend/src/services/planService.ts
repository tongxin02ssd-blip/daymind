import { prisma } from "../utils/prisma";
import { ensureDailyEntry, dailyInclude } from "./dailyService";

async function findOwnedPlan(userId: string, planId: string) {
  const plan = await prisma.dailyPlan.findFirst({
    where: { id: planId, entry: { userId } },
    include: { entry: true }
  });
  if (!plan) {
    const error = new Error("Plan not found");
    (error as Error & { status?: number }).status = 404;
    throw error;
  }
  return plan;
}

export async function createPlan(userId: string, date: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) {
    const error = new Error("Plan content is required");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  const entry = await ensureDailyEntry(userId, date);
  const lastPlan = await prisma.dailyPlan.findFirst({
    where: { entryId: entry.id },
    orderBy: { sortOrder: "desc" }
  });

  await prisma.dailyPlan.create({
    data: {
      entryId: entry.id,
      content: trimmed,
      completed: false,
      sortOrder: (lastPlan?.sortOrder ?? -1) + 1
    }
  });

  return prisma.dailyEntry.findUniqueOrThrow({
    where: { id: entry.id },
    include: dailyInclude
  });
}

export async function updatePlan(
  userId: string,
  planId: string,
  data: { content?: string; note?: string; completed?: boolean; sortOrder?: number }
) {
  const plan = await findOwnedPlan(userId, planId);
  const content = typeof data.content === "string" ? data.content.trim() : undefined;
  const note = typeof data.note === "string" ? data.note.trim() : undefined;
  if (content !== undefined && !content) {
    const error = new Error("Plan content is required");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  await prisma.dailyPlan.update({
    where: { id: planId },
    data: {
      content,
      note,
      completed: typeof data.completed === "boolean" ? data.completed : undefined,
      sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : undefined
    }
  });

  return prisma.dailyEntry.findUniqueOrThrow({
    where: { id: plan.entryId },
    include: dailyInclude
  });
}

export async function deletePlan(userId: string, planId: string) {
  const plan = await findOwnedPlan(userId, planId);
  await prisma.dailyPlan.delete({ where: { id: planId } });
  return prisma.dailyEntry.findUniqueOrThrow({
    where: { id: plan.entryId },
    include: dailyInclude
  });
}
