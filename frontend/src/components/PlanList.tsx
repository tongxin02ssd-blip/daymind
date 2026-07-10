import { FormEvent, useState } from "react";
import { DailyPlan } from "../types";
import { Button } from "./base/Button";
import { Input } from "./base/Input";
import { PlanItem } from "./PlanItem";

type Props = {
  plans: DailyPlan[];
  editable: boolean;
  canToggleComplete: boolean;
  onCreate: (content: string) => Promise<void>;
  onUpdate: (planId: string, payload: { content?: string; completed?: boolean }) => Promise<void>;
  onDelete: (planId: string) => Promise<void>;
};

export function PlanList({ plans, editable, canToggleComplete, onCreate, onUpdate, onDelete }: Props) {
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setCreating(true);
    try {
      await onCreate(content);
      setContent("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="block">
      <div className="section-header compact">
        <div>
          <h2>今日计划</h2>
        </div>
      </div>
      <div className="plan-list">
        {plans.map((plan) => (
          <PlanItem
            key={plan.id}
            plan={plan}
            editable={editable}
            canToggleComplete={canToggleComplete}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
      {editable && (
        <form className="add-plan" onSubmit={submit}>
          <Input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="添加一条计划"
          />
          <Button disabled={creating}>{creating ? "添加中" : "添加"}</Button>
        </form>
      )}
    </section>
  );
}
