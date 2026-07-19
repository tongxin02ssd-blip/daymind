import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Textarea } from "./base/Textarea";

type Props = {
  date: string;
  value: string;
  editable: boolean;
  onSave: (date: string, record: string) => Promise<void>;
};

export type DailyRecordEditorHandle = {
  flush: () => Promise<void>;
};

export const DailyRecordEditor = forwardRef<DailyRecordEditorHandle, Props>(
  function DailyRecordEditor({ date, value, editable, onSave }, ref) {
    const [record, setRecord] = useState(value);
    const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
    const latestRecord = useRef(value);
    const lastSavedRecord = useRef(value);
    const queuedRecord = useRef<string | null>(null);
    const activeSave = useRef<Promise<void> | null>(null);
    const timer = useRef<number | null>(null);
    const composing = useRef(false);
    const mounted = useRef(true);
    const onSaveRef = useRef(onSave);

    useEffect(() => {
      onSaveRef.current = onSave;
    }, [onSave]);

    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        clearSaveTimer();
      };
    }, []);

    function clearSaveTimer() {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    }

    function startSaveQueue() {
      if (activeSave.current) return activeSave.current;

      const run = (async () => {
        while (queuedRecord.current !== null) {
          const nextRecord = queuedRecord.current;
          queuedRecord.current = null;

          if (nextRecord === lastSavedRecord.current) continue;
          if (mounted.current) setStatus("saving");

          try {
            await onSaveRef.current(date, nextRecord);
            lastSavedRecord.current = nextRecord;
            if (
              mounted.current &&
              latestRecord.current === nextRecord &&
              queuedRecord.current === null &&
              timer.current === null
            ) {
              setStatus("saved");
            }
          } catch (error) {
            if (mounted.current) setStatus("idle");
            if (queuedRecord.current === null) throw error;
          }
        }
      })();

      activeSave.current = run;
      void run.then(
        () => {
          if (activeSave.current === run) activeSave.current = null;
          if (queuedRecord.current !== null) {
            void startSaveQueue().catch(() => undefined);
          }
        },
        () => {
          if (activeSave.current === run) activeSave.current = null;
        }
      );
      return run;
    }

    function enqueueSave(nextRecord: string) {
      if (nextRecord === lastSavedRecord.current && !activeSave.current) {
        if (mounted.current) setStatus("saved");
        return Promise.resolve();
      }
      queuedRecord.current = nextRecord;
      return startSaveQueue();
    }

    function scheduleSave(nextRecord: string) {
      clearSaveTimer();
      if (!editable) return;
      if (composing.current) {
        setStatus("saving");
        return;
      }
      if (nextRecord === lastSavedRecord.current && !activeSave.current) {
        setStatus("saved");
        return;
      }

      setStatus("saving");
      timer.current = window.setTimeout(() => {
        timer.current = null;
        void enqueueSave(latestRecord.current).catch(() => undefined);
      }, 800);
    }

    async function flush() {
      clearSaveTimer();
      if (!editable || composing.current) return;

      await enqueueSave(latestRecord.current);
      while (activeSave.current) {
        await activeSave.current;
      }
    }

    useImperativeHandle(ref, () => ({ flush }));

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
          onChange={(event) => {
            const nextRecord = event.target.value;
            latestRecord.current = nextRecord;
            setRecord(nextRecord);
            scheduleSave(nextRecord);
          }}
          onCompositionStart={() => {
            composing.current = true;
            clearSaveTimer();
          }}
          onCompositionEnd={(event) => {
            composing.current = false;
            const nextRecord = event.currentTarget.value;
            latestRecord.current = nextRecord;
            setRecord(nextRecord);
            scheduleSave(nextRecord);
          }}
          onBlur={() => {
            if (!composing.current) void flush().catch(() => undefined);
          }}
          placeholder="今天发生了什么，简单写几句就好。"
        />
      </section>
    );
  }
);
