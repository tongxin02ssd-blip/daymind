import { DailyReport } from "../types";

export function DailyReportCard({ report }: { report: DailyReport | null }) {
  if (!report) {
    return (
      <section className="report-card empty-report">
        <div className="report-empty-icon" aria-hidden="true">
          <span />
        </div>
        <div>
          <span className="section-kicker">DayMind Insight</span>
          <h2>等待生成今日洞察</h2>
          <p>生成后，你会看到一段关于今天状态的完整洞察，以及一条明日建议。</p>
        </div>
      </section>
    );
  }

  const insightText = [report.conclusion, report.surfaceReason, report.deepReason]
    .map((text) => text.trim())
    .filter(Boolean)
    .join(" ");

  return (
    <section className="report-card">
      <div className="report-topline">
        <div>
          <span className="section-kicker">DayMind Insight</span>
          <h2>今日洞察</h2>
        </div>
        <strong className="state-badge"><span aria-hidden="true" />{report.stateType}</strong>
      </div>
      <div className="insight-body">
        <p>{insightText}</p>
      </div>
      <div className="insight-suggestion">
        <span className="suggestion-mark" aria-hidden="true" />
        <div>
          <h3>明日建议</h3>
          <p>{report.suggestion}</p>
        </div>
      </div>
    </section>
  );
}
