import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as api from "../api/daymind";
import { getApiErrorMessage } from "../api/errors";
import { BackgroundContextEditor } from "../components/BackgroundContextEditor";
import { DailyRecordEditor, DailyRecordEditorHandle } from "../components/DailyRecordEditor";
import { DailyReportCard } from "../components/DailyReportCard";
import { DateTabs } from "../components/DateTabs";
import { GenerateReportButton } from "../components/GenerateReportButton";
import { PlanList } from "../components/PlanList";
import { Button } from "../components/base/Button";
import { Card } from "../components/base/Card";
import { Loading } from "../components/base/Loading";
import { useAuth } from "../hooks/useAuth";
import { DailyEntry, HistoryDaySummary, UserContext } from "../types";
import { addDays, compareDate, monthBounds, todayString } from "../utils/date";

export function AppPage() {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [visibleMonth, setVisibleMonth] = useState(todayString().slice(0, 7));
  const [historySummaries, setHistorySummaries] = useState<HistoryDaySummary[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [context, setContext] = useState<UserContext | null>(null);
  const [daily, setDaily] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedDateRef = useRef(selectedDate);
  const dailyRequestId = useRef(0);
  const pendingPlanUpdates = useRef<Promise<void>>(Promise.resolve());
  const pendingRecordUpdates = useRef<Promise<void>>(Promise.resolve());
  const recordEditorRef = useRef<DailyRecordEditorHandle | null>(null);
  selectedDateRef.current = selectedDate;

  const dateKind = useMemo(() => compareDate(selectedDate), [selectedDate]);
  const planEditable = dateKind !== "past";
  const canToggleComplete = dateKind === "today";
  const recordEditable = dateKind === "today";

  const updateSummaryFromDaily = useCallback((next: DailyEntry) => {
    const summary: HistoryDaySummary = {
      date: next.date,
      hasContent: Boolean(next.record.trim() || next.plans.length),
      hasReport: Boolean(next.report),
      planCount: next.plans.length
    };
    setHistorySummaries((current) => {
      const withoutDate = current.filter((item) => item.date !== next.date);
      if (!summary.hasContent && !summary.hasReport) return withoutDate;
      return [...withoutDate, summary].sort((a, b) => a.date.localeCompare(b.date));
    });
  }, []);

  const loadDaily = useCallback(async (date: string) => {
    const requestId = ++dailyRequestId.current;
    setLoading(true);
    setDaily(null);
    setError("");
    try {
      await pendingRecordUpdates.current.catch(() => undefined);
      if (requestId !== dailyRequestId.current) return;
      const data = await api.getDaily(date);
      if (requestId === dailyRequestId.current) setDaily(data);
      updateSummaryFromDaily(data);
    } catch (err) {
      if (requestId === dailyRequestId.current) {
        setError(getApiErrorMessage(err, "加载失败"));
      }
    } finally {
      if (requestId === dailyRequestId.current) setLoading(false);
    }
  }, [updateSummaryFromDaily]);

  useEffect(() => {
    api.getContext().then(setContext).catch((err) => setError(getApiErrorMessage(err, "背景目标加载失败")));
  }, []);

  useEffect(() => {
    loadDaily(selectedDate);
  }, [loadDaily, selectedDate]);

  useEffect(() => {
    let active = true;
    const { start, end } = monthBounds(visibleMonth);
    setSummaryLoading(true);
    api.getHistorySummary(addDays(start, -7), addDays(end, 7))
      .then((days) => {
        if (active) setHistorySummaries(days);
      })
      .catch(() => {
        if (active) setHistorySummaries([]);
      })
      .finally(() => {
        if (active) setSummaryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [visibleMonth]);

  async function updateContext(payload: Partial<Pick<UserContext, "content" | "isExpanded">>) {
    const result = await api.updateContext(payload);
    setContext(result);
  }

  async function refreshAfterDailyChange(next: DailyEntry) {
    if (next.date === selectedDateRef.current) setDaily(next);
    updateSummaryFromDaily(next);
  }

  async function handleCreatePlan(content: string) {
    await refreshAfterDailyChange(await api.createPlan(selectedDate, content));
  }

  function handleUpdatePlan(planId: string, payload: { content?: string; note?: string; completed?: boolean }) {
    const update = pendingPlanUpdates.current
      .catch(() => undefined)
      .then(async () => {
        await refreshAfterDailyChange(await api.updatePlan(planId, payload));
      });
    pendingPlanUpdates.current = update;
    return update;
  }

  async function handleDeletePlan(planId: string) {
    await refreshAfterDailyChange(await api.deletePlan(planId));
  }

  const handleSaveRecord = useCallback((date: string, record: string) => {
    const update = pendingRecordUpdates.current
      .catch(() => undefined)
      .then(async () => {
        const next = await api.updateRecord(date, record);
        updateSummaryFromDaily(next);
      });
    pendingRecordUpdates.current = update;
    return update;
  }, [updateSummaryFromDaily]);

  function handleSelectDate(date: string) {
    if (date === selectedDate) return;
    void recordEditorRef.current?.flush().catch(() => undefined);
    setSelectedDate(date);
  }

  async function handleGenerateReport() {
    setReportLoading(true);
    setError("");
    try {
      await recordEditorRef.current?.flush();
      await pendingRecordUpdates.current;
      await pendingPlanUpdates.current;
      await api.generateReport(selectedDate);
      await loadDaily(selectedDate);
    } catch (err) {
      setError(getApiErrorMessage(err, "生成失败"));
    } finally {
      setReportLoading(false);
    }
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() || "D";
  const selectedDateLabel = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(new Date(`${selectedDate}T00:00:00`));

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-mark brand-mark-small" aria-hidden="true">D</div>
          <div>
            <h1>DayMind</h1>
            <p>记录真实一天，看清自己的状态。</p>
          </div>
        </div>
        <div className="topbar-account">
          <div className="user-avatar" aria-hidden="true">{userInitial}</div>
          <div className="user-meta">
            <span>我的日记</span>
            <p>{user?.email}</p>
          </div>
          <Button className="logout-button" variant="ghost" onClick={logout}>退出登录</Button>
        </div>
      </header>

      <div className="layout">
        <div className="main-column">
          <BackgroundContextEditor context={context} onSave={updateContext} />
          <DateTabs
            selectedDate={selectedDate}
            visibleMonth={visibleMonth}
            summaries={historySummaries}
            summaryLoading={summaryLoading}
            onSelect={handleSelectDate}
            onVisibleMonthChange={setVisibleMonth}
          />
          <Card className="day-card">
            <div className="current-date">
              <div>
                <span className="eyebrow">每日复盘</span>
                <strong>{selectedDateLabel}</strong>
              </div>
              <div className="date-context-badges">
                {dateKind === "today" && <span className="today-badge">今天</span>}
                {dateKind === "past" && <span className="today-badge history-badge">历史查看</span>}
                {dateKind === "future" && <span className="today-badge future-badge">提前计划</span>}
                {daily?.report && <span className="today-badge report-badge">已有洞察</span>}
              </div>
            </div>

            {loading || !daily ? (
              <Loading />
            ) : (
              <>
                <PlanList
                  plans={daily.plans}
                  editable={planEditable}
                  canToggleComplete={canToggleComplete}
                  onCreate={handleCreatePlan}
                  onUpdate={handleUpdatePlan}
                  onDelete={handleDeletePlan}
                />

                {dateKind !== "future" && (
                  <>
                    <DailyRecordEditor
                      key={daily.date}
                      ref={recordEditorRef}
                      date={daily.date}
                      value={daily.record}
                      editable={recordEditable}
                      onSave={handleSaveRecord}
                    />
                    {dateKind === "today" && (
                      <>
                        <GenerateReportButton
                          loading={reportLoading}
                          onClick={handleGenerateReport}
                        />
                      </>
                    )}
                    <DailyReportCard report={daily.report} />
                    {daily.report?.backgroundSnapshot && (
                      <section className="snapshot">
                        <h3>生成洞察时的背景快照</h3>
                        <p>{daily.report.backgroundSnapshot}</p>
                      </section>
                    )}
                  </>
                )}
              </>
            )}
            {error && <div className="error-text page-error" role="alert">{error}</div>}
          </Card>
        </div>
      </div>
    </main>
  );
}
