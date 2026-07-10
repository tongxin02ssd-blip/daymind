import { api } from "./client";
import { DailyEntry, GenerateReportResponse, User, UserContext } from "../types";

export async function register(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>("/auth/register", {
    email,
    password
  });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>("/auth/login", {
    email,
    password
  });
  return data;
}

export async function me() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function getContext() {
  const { data } = await api.get<{ context: UserContext }>("/context");
  return data.context;
}

export async function updateContext(payload: Partial<Pick<UserContext, "content" | "isExpanded">>) {
  const { data } = await api.put<{ context: UserContext }>("/context", payload);
  return data.context;
}

export async function getDaily(date: string) {
  const { data } = await api.get<{ daily: DailyEntry }>(`/daily/${date}`);
  return data.daily;
}

export async function updateRecord(date: string, record: string) {
  const { data } = await api.put<{ daily: DailyEntry }>(`/daily/${date}/record`, { record });
  return data.daily;
}

export async function createPlan(date: string, content: string) {
  const { data } = await api.post<{ daily: DailyEntry }>(`/daily/${date}/plans`, { content });
  return data.daily;
}

export async function updatePlan(
  planId: string,
  payload: { content?: string; completed?: boolean; sortOrder?: number }
) {
  const { data } = await api.put<{ daily: DailyEntry }>(`/plans/${planId}`, payload);
  return data.daily;
}

export async function deletePlan(planId: string) {
  const { data } = await api.delete<{ daily: DailyEntry }>(`/plans/${planId}`);
  return data.daily;
}

export async function generateReport(date: string) {
  const { data } = await api.post<GenerateReportResponse>(`/daily/${date}/report/generate`);
  return data;
}

export async function getHistory(start: string, end: string) {
  const { data } = await api.get<{ history: DailyEntry[] }>("/history", {
    params: { start, end }
  });
  return data.history;
}
