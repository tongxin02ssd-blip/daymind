import { useEffect, useRef, useState } from "react";
import { Textarea } from "./base/Textarea";

type Props = {
  value: string;
  editable: boolean;
  onSave: (record: string) => Promise<void>;
};

export function DailyRecordEditor({ value, editable, onSave }: Props) {
  const [record, setRecord] = useState(value);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const firstRun = useRef(true);

  useEffect(() => {
    setRecord(value);
    firstRun.current = true;
  }, [value]);

  useEffect(() => {
    if (!editable) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setStatus("saving");
    const timer = window.setTimeout(() => {
      onSave(record)
        .then(() => setStatus("saved"))
        .catch(() => setStatus("idle"));
    }, 800);
    return () => window.clearTimeout(timer);
  }, [editable, onSave, record]);

  return (
    <section className="block">
      <div className="section-header compact">
        <div>
          <span className="section-kicker">写下此刻</span>
          <h2>今日记录</h2>
        </div>
        {editable && <span className="save-status">{status === "saving" ? "保存中" : status === "saved" ? "已保存" : ""}</span>}
      </div>
      <Textarea
        className="record-textarea"
        rows={9}
        value={record}
        disabled={!editable}
        onChange={(event) => setRecord(event.target.value)}
        placeholder="今天发生了什么，简单写几句就好。"
      />
    </section>
  );
}
