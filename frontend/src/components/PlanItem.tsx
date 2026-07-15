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
    <div className={plan.completed ? "plan-item completed" : "plan-item"}>
      <label className="plan-check">
        <input
          type="checkbox"
          checked={plan.completed}
          disabled={!canToggleComplete}
          aria-label={plan.completed ? `将计划标记为未完成：${plan.content}` : `将计划标记为已完成：${plan.content}`}
          onChange={(event) => onUpdate(plan.id, { completed: event.target.checked })}
        />
        <span aria-hidden="true" />
      </label>
      <Input
        value={content}
        disabled={!editable}
        aria-label="计划内容"
        onChange={(event) => setContent(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      {editable && (
        <Button className="plan-delete" variant="ghost" onClick={() => onDelete(plan.id)} disabled={saving} aria-label={`删除计划：${plan.content}`}>
          删除
        </Button>
      )}
    </div>
  );
}
