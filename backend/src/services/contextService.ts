import { prisma } from "../utils/prisma";

export async function getContext(userId: string) {
  return prisma.userContext.upsert({
    where: { userId },
    update: {},
    create: { userId, content: "", isExpanded: true }
  });
}

export async function updateContext(
  userId: string,
  data: { content?: string; isExpanded?: boolean }
) {
  const existing = await getContext(userId);
  return prisma.userContext.update({
    where: { id: existing.id },
    data: {
      content: typeof data.content === "string" ? data.content : undefined,
      isExpanded: typeof data.isExpanded === "boolean" ? data.isExpanded : undefined
    }
  });
}
