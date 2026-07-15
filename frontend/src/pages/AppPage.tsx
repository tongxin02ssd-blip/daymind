import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../api/daymind";
import { getApiErrorMessage } from "../api/errors";
import { BackgroundContextEditor } from "../components/BackgroundContextEditor";
import { DailyRecordEditor } from "../components/DailyRecordEditor";
import { DailyReportCard } from "../components/DailyReportCard";
import { DateTabs } from "../components/DateTabs";
import { GenerateReportButton } from "../components/GenerateReportButton";
import { PlanList } from "../components/PlanList";
import { Button } from "../components/base/Button";
import { Card } from "../components/base/Card";
import { Loading } from "../components/base/Loading";
import { useAuth } from "../hooks/useAuth";
import { DailyEntry, UserContext } from "../types";
import { compareDate, todayString } from "../utils/date";

export function AppPage() {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [context, setContext] = useState<UserContext | null>(null);
  const [daily, setDaily] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");

  const dateKind = useMemo(() => compareDate(selectedDate), [selectedDate]);
  const planEditable = dateKind !== "past";
  const canToggleComplete = dateKind === "today";
  const recordEditable = dateKind === "today";

  const loadDaily = useCallback(async (date: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getDaily(date);
      setDaily(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "加载失败"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.getContext().then(setContext).catch((err) => setError(getApiErrorMessage(err, "背景目标加载失败")));
  }, []);

  useEffect(() => {
    loadDaily(selectedDate);
  }, [loadDaily, selectedDate]);

  async function updateContext(payload: Partial<Pick<UserContext, "content" | "isExpanded">>) {
    const result = await api.updateContext(payload);
    setContext(result);
  }

  async function refreshAfterDailyChange(next: DailyEntry) {
    setDaily(next);
  }

  async function handleCreatePlan(content: string) {
    await refreshAfterDailyChange(await api.createPlan(selectedDate, content));
  }

  async function handleUpdatePlan(planId: string, payload: { content?: string; completed?: boolean }) {
    await refreshAfterDailyChange(await api.updatePlan(planId, payload));
  }

  async function handleDeletePlan(planId: string) {
    await refreshAfterDailyChange(await api.deletePlan(planId));
  }

  const handleSaveRecord = useCallback(
    async (record: string) => {
      const next = await api.updateRecord(selectedDate, record);
      setDaily(next);
    },
    [selectedDate]
  );

  async function handleGenerateReport() {
    setReportLoading(true);
    setError("");
    try {
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
          <DateTabs selectedDate={selectedDate} onSelect={setSelectedDate} />
          <Card className="day-card">
            <div className="current-date">
              <div>
                <span className="eyebrow">每日复盘</span>
                <strong>{selectedDateLabel}</strong>
              </div>
              {dateKind === "today" && <span className="today-badge">今天</span>}
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
