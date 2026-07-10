import { DailyReport } from "../types";
import { EmptyState } from "./base/EmptyState";

export function DailyReportCard({ report }: { report: DailyReport | null }) {
  if (!report) {
    return (
      <section className="report-card empty-report">
        <EmptyState text="尚未生成状态报告" />
      </section>
    );
  }

  return (
    <section className="report-card">
      <div className="report-topline">
        <span>今日状态报告</span>
        <strong>{report.stateType}</strong>
      </div>
      <div className="report-row primary">
        <label>核心结论</label>
        <p>{report.conclusion}</p>
      </div>
      <div className="report-row">
        <label>表层原因</label>
        <p>{report.surfaceReason}</p>
      </div>
      <div className="report-row">
        <label>底层原因</label>
        <p>{report.deepReason}</p>
      </div>
      <div className="report-row suggestion">
        <label>明日建议</label>
        <p>{report.suggestion}</p>
      </div>
    </section>
  );
}
