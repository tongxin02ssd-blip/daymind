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
  for (let offset = -3; offset <= 3; offset += 1) {
    result.push(addDays(baseDate, offset));
  }
  return result;
}

export function shortDate(date: string) {
  return date.slice(5);
}

export function weekdayLabel(date: string) {
  return new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(
    new Date(`${date}T00:00:00`)
  );
}

export function monthBounds(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return {
    start: `${month}-01`,
    end: formatDate(new Date(year, monthNumber, 0))
  };
}

export function calendarDates(month: string) {
  const { start, end } = monthBounds(month);
  const firstDay = new Date(`${start}T00:00:00`).getDay();
  const leadingDays = (firstDay + 6) % 7;
  const gridStart = addDays(start, -leadingDays);
  const totalDays = leadingDays + Number(end.slice(8));
  const cellCount = Math.ceil(totalDays / 7) * 7;
  return Array.from({ length: cellCount }, (_, index) => addDays(gridStart, index));
}

export function shiftMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  return formatDate(new Date(year, monthNumber - 1 + offset, 1)).slice(0, 7);
}

export function compareDate(date: string, today = todayString()) {
  if (date < today) return "past";
  if (date > today) return "future";
  return "today";
}

export function historyStart(days = 90) {
  return addDays(todayString(), -days);
}
