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
          <h2>近期目标</h2>
        </div>
        <Button variant="ghost" onClick={() => save({ isExpanded: !isExpanded })}>
          {isExpanded ? "折叠" : "展开"}
        </Button>
      </div>
      {isExpanded && (
        <div className="context-body">
          <Textarea
            rows={4}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="例如：7月15日前完成论文引言修改。每天至少复习 1 个前端面试知识点。"
          />
          <div className="right-actions">
            <Button onClick={() => save({ content })} disabled={saving}>
              {saving ? "保存中" : "保存"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
