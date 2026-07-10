export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayString() {
  return formatDate(new Date());
}

export function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function dateTabs(baseDate = todayString()) {
  const result: string[] = [];
  for (let offset = -5; offset <= 3; offset += 1) {
    result.push(addDays(baseDate, offset));
  }
  return result;
}

export function shortDate(date: string) {
  return date.slice(5);
}

export function compareDate(date: string, today = todayString()) {
  if (date < today) return "past";
  if (date > today) return "future";
  return "today";
}

export function historyStart(days = 90) {
  return addDays(todayString(), -days);
}
