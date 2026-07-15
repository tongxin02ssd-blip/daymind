import { Button } from "./base/Button";

type Props = {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
};

export function GenerateReportButton({ disabled, loading, onClick }: Props) {
  return (
    <div className="report-actions">
      <Button className="generate-button" onClick={onClick} disabled={disabled || loading}>
        {loading && <span className="button-spinner" aria-hidden="true" />}
        {loading ? "正在生成洞察…" : "生成今日洞察"}
        {!loading && <span className="button-arrow" aria-hidden="true">→</span>}
      </Button>
    </div>
  );
}
