import { dateTabs, shortDate } from "../utils/date";

type Props = {
  selectedDate: string;
  onSelect: (date: string) => void;
};

export function DateTabs({ selectedDate, onSelect }: Props) {
  return (
    <nav className="date-picker-row" aria-label="日期导航">
      <div className="date-tabs">
        {dateTabs().map((date) => (
          <button
            key={date}
            className={date === selectedDate ? "date-tab active" : "date-tab"}
            onClick={() => onSelect(date)}
            aria-label={`选择 ${date}`}
            aria-current={date === selectedDate ? "date" : undefined}
          >
            {shortDate(date)}
          </button>
        ))}
      </div>
      <label className="date-input-wrap">
        <span className="calendar-icon" aria-hidden="true" />
        <span>选择日期</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => {
            if (event.target.value) onSelect(event.target.value);
          }}
        />
      </label>
    </nav>
  );
}
