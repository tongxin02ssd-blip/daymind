import { useMemo, useState } from "react";
import { HistoryDaySummary } from "../types";
import {
  calendarDates,
  dateTabs,
  shiftMonth,
  shortDate,
  todayString,
  weekdayLabel
} from "../utils/date";

type Props = {
  selectedDate: string;
  visibleMonth: string;
  summaries: HistoryDaySummary[];
  summaryLoading: boolean;
  onSelect: (date: string) => void;
  onVisibleMonthChange: (month: string) => void;
};

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

export function DateTabs({
  selectedDate,
  visibleMonth,
  summaries,
  summaryLoading,
  onSelect,
  onVisibleMonthChange
}: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const summaryMap = useMemo(
    () => new Map(summaries.map((summary) => [summary.date, summary])),
    [summaries]
  );
  const today = todayString();

  function selectDate(date: string) {
    onSelect(date);
    onVisibleMonthChange(date.slice(0, 7));
    setCalendarOpen(false);
  }

  return (
    <section className="date-navigator" aria-label="日期导航">
      <div className="date-picker-row">
        <div className="date-tabs">
          {dateTabs(selectedDate).map((date) => {
            const summary = summaryMap.get(date);
            return (
              <button
                key={date}
                className={date === selectedDate ? "date-tab active" : "date-tab"}
                onClick={() => selectDate(date)}
                aria-label={`选择 ${date}${summary?.hasReport ? "，已有洞察" : summary?.hasContent ? "，有记录" : ""}`}
                aria-current={date === selectedDate ? "date" : undefined}
              >
                <span className="date-tab-weekday">{date === today ? "今天" : weekdayLabel(date)}</span>
                <span>{shortDate(date)}</span>
                <DateMarkers summary={summary} />
              </button>
            );
          })}
        </div>
        <button
          className={calendarOpen ? "calendar-trigger active" : "calendar-trigger"}
          type="button"
          onClick={() => setCalendarOpen((value) => !value)}
          aria-expanded={calendarOpen}
          aria-controls="history-calendar"
        >
          <span className="calendar-icon" aria-hidden="true" />
          <span>月历</span>
          <span className="calendar-trigger-date">{selectedDate}</span>
        </button>
      </div>

      {calendarOpen && (
        <div className="history-calendar" id="history-calendar">
          <div className="calendar-toolbar">
            <button type="button" onClick={() => onVisibleMonthChange(shiftMonth(visibleMonth, -1))} aria-label="上个月">‹</button>
            <input
              type="month"
              value={visibleMonth}
              aria-label="选择月份"
              onChange={(event) => event.target.value && onVisibleMonthChange(event.target.value)}
            />
            <button type="button" onClick={() => onVisibleMonthChange(shiftMonth(visibleMonth, 1))} aria-label="下个月">›</button>
            <button className="calendar-today" type="button" onClick={() => selectDate(today)}>回到今天</button>
          </div>
          <div className="calendar-weekdays" aria-hidden="true">
            {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className={summaryLoading ? "calendar-grid loading-summary" : "calendar-grid"}>
            {calendarDates(visibleMonth).map((date) => {
              const summary = summaryMap.get(date);
              const classes = [
                "calendar-day",
                date.slice(0, 7) !== visibleMonth ? "outside" : "",
                date === selectedDate ? "selected" : "",
                date === today ? "today" : ""
              ].filter(Boolean).join(" ");
              return (
                <button
                  type="button"
                  key={date}
                  className={classes}
                  onClick={() => selectDate(date)}
                  aria-label={`${date}${summary?.hasReport ? "，已有洞察" : summary?.hasContent ? "，有记录" : ""}`}
                >
                  <span>{Number(date.slice(8))}</span>
                  <DateMarkers summary={summary} />
                </button>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span><i className="status-dot content" />有记录</span>
            <span><i className="status-dot report" />已有洞察</span>
            {summaryLoading && <span className="calendar-loading-text">更新中…</span>}
          </div>
        </div>
      )}
    </section>
  );
}

function DateMarkers({ summary }: { summary?: HistoryDaySummary }) {
  if (!summary?.hasContent && !summary?.hasReport) return <span className="date-markers" aria-hidden="true" />;
  return (
    <span className="date-markers" aria-hidden="true">
      {summary.hasContent && <i className="status-dot content" />}
      {summary.hasReport && <i className="status-dot report" />}
    </span>
  );
}
