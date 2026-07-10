import { useEffect, useState } from "react";
import { DailyPlan } from "../types";
import { Button } from "./base/Button";
import { Input } from "./base/Input";

type Props = {
  plan: DailyPlan;
  editable: boolean;
  canToggleComplete: boolean;
  onUpdate: (planId: string, payload: { content?: string; completed?: boolean }) => Promise<void>;
  onDelete: (planId: string) => Promise<void>;
};

export function PlanItem({ plan, editable, canToggleComplete, onUpdate, onDelete }: Props) {
  const [content, setContent] = useState(plan.content);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(plan.content);
  }, [plan.content]);

  async function commit() {
    if (!editable || content.trim() === plan.content) return;
    setSaving(true);
    try {
      await onUpdate(plan.id, { content });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="plan-item">
      <label className="plan-check">
        <input
          type="checkbox"
          checked={plan.completed}
          disabled={!canToggleComplete}
          onChange={(event) => onUpdate(plan.id, { completed: event.target.checked })}
        />
      </label>
      <Input
        value={content}
        disabled={!editable}
        onChange={(event) => setContent(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      {editable && (
        <Button variant="ghost" onClick={() => onDelete(plan.id)} disabled={saving}>
          删除
        </Button>
      )}
    </div>
  );
}
