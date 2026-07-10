import { dateTabs, shortDate } from "../utils/date";

type Props = {
  selectedDate: string;
  onSelect: (date: string) => void;
};

export function DateTabs({ selectedDate, onSelect }: Props) {
  return (
    <div className="date-picker-row">
      <div className="date-tabs" aria-label="日期栏">
        {dateTabs().map((date) => (
          <button
            key={date}
            className={date === selectedDate ? "date-tab active" : "date-tab"}
            onClick={() => onSelect(date)}
          >
            {shortDate(date)}
          </button>
        ))}
      </div>
      <label className="date-input-wrap">
        <span>选择日期</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => {
            if (event.target.value) onSelect(event.target.value);
          }}
        />
      </label>
    </div>
  );
}
