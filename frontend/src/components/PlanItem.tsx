import { useEffect, useState } from "react";
import { DailyPlan } from "../types";
import { Button } from "./base/Button";
import { Input } from "./base/Input";
import { Textarea } from "./base/Textarea";

type Props = {
  plan: DailyPlan;
  editable: boolean;
  canToggleComplete: boolean;
  onUpdate: (planId: string, payload: { content?: string; note?: string; completed?: boolean }) => Promise<void>;
  onDelete: (planId: string) => Promise<void>;
};

export function PlanItem({ plan, editable, canToggleComplete, onUpdate, onDelete }: Props) {
  const [content, setContent] = useState(plan.content);
  const [note, setNote] = useState(plan.note);
  const [noteOpen, setNoteOpen] = useState(Boolean(plan.note));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(plan.content);
  }, [plan.content]);

  useEffect(() => {
    setNote(plan.note);
    if (plan.note) setNoteOpen(true);
  }, [plan.note]);

  async function commit() {
    if (!editable || content.trim() === plan.content) return;
    setSaving(true);
    try {
      await onUpdate(plan.id, { content });
    } finally {
      setSaving(false);
    }
  }

  async function commitNote() {
    if (!editable || note.trim() === plan.note) return;
    setSaving(true);
    try {
      await onUpdate(plan.id, { note });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={plan.completed ? "plan-item completed" : "plan-item"}>
      <div className="plan-main">
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
          className="plan-content-input"
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
          <div className="plan-item-actions">
            <Button
              className={plan.note ? "plan-note-toggle has-note" : "plan-note-toggle"}
              variant="ghost"
              type="button"
              onClick={() => setNoteOpen((value) => !value)}
              aria-expanded={noteOpen}
            >
              {plan.note ? "备注" : "+ 备注"}
            </Button>
            <Button className="plan-delete" variant="ghost" type="button" onClick={() => onDelete(plan.id)} disabled={saving} aria-label={`删除计划：${plan.content}`}>
              删除
            </Button>
          </div>
        )}
      </div>
      {(noteOpen || (!editable && Boolean(plan.note))) && (
        <div className="plan-note-area">
          <span className="plan-note-label">进展备注</span>
          {editable ? (
            <Textarea
              className="plan-note-input"
              rows={2}
              value={note}
              aria-label={`计划备注：${plan.content}`}
              onChange={(event) => setNote(event.target.value)}
              onBlur={commitNote}
              placeholder="实际做到了哪里、遇到了什么，或为什么没完成…"
            />
          ) : (
            <p className="plan-note-readonly">{plan.note}</p>
          )}
          {saving && <span className="plan-note-status">保存中…</span>}
        </div>
      )}
    </div>
  );
}
