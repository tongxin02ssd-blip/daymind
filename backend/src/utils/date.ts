const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function assertDateString(date: string) {
  if (!DATE_RE.test(date)) {
    const error = new Error("date must be YYYY-MM-DD");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
}

export function addDays(date: string, days: number) {
  assertDateString(date);
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function recentDateRange(date: string, days: number) {
  const result: string[] = [];
  for (let i = days; i >= 1; i -= 1) {
    result.push(addDays(date, -i));
  }
  return result;
}
