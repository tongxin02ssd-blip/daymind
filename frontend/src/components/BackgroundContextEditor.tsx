import { useEffect, useState } from "react";
import { UserContext } from "../types";
import { Button } from "./base/Button";
import { Card } from "./base/Card";
import { Textarea } from "./base/Textarea";

type Props = {
  context: UserContext | null;
  onSave: (payload: Partial<Pick<UserContext, "content" | "isExpanded">>) => Promise<void>;
};

export function BackgroundContextEditor({ context, onSave }: Props) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(context?.content || "");
  }, [context?.content]);

  async function save(payload: Partial<Pick<UserContext, "content" | "isExpanded">>) {
    setSaving(true);
    try {
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  const isExpanded = context?.isExpanded ?? true;

  return (
    <Card className="context-card">
      <div className="section-header">
        <div>
          <span className="section-kicker">阶段背景</span>
          <h2>近期目标</h2>
          <p>生成今日洞察时会作为背景参考</p>
        </div>
        <Button className="collapse-button" variant="ghost" onClick={() => save({ isExpanded: !isExpanded })} disabled={saving}>
          {isExpanded ? "收起" : "展开"}<span aria-hidden="true">{isExpanded ? "↑" : "↓"}</span>
        </Button>
      </div>
      {isExpanded && (
        <div className="context-body">
          <Textarea
            rows={4}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="写下你最近在推进的事情，或此刻最想关注的目标。"
          />
          <div className="right-actions">
            <Button className="context-save" onClick={() => save({ content })} disabled={saving}>
              {saving ? "保存中…" : "保存目标"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
