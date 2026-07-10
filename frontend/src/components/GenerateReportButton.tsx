import { Button } from "./base/Button";

type Props = {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
};

export function GenerateReportButton({ disabled, loading, onClick }: Props) {
  return (
    <div className="report-actions">
      <Button onClick={onClick} disabled={disabled || loading}>
        {loading ? "生成中" : "生成今日状态报告"}
      </Button>
    </div>
  );
}
