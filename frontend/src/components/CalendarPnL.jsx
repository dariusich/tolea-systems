import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

function money(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function monthLabel(date) {
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date);
}

function buildMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  const mondayOffset = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const item = new Date(start);
    item.setDate(start.getDate() + index);
    return item;
  });
}

export default function CalendarPnL({ days, tradesByDay, currency, selectedDate, onSelectDate }) {
  const latestDate = days?.length ? new Date(days[days.length - 1].date + "T00:00:00") : new Date();
  const [month, setMonth] = useState(new Date(latestDate.getFullYear(), latestDate.getMonth(), 1));
  const dayMap = useMemo(() => new Map((days || []).map((day) => [day.date, day])), [days]);
  const monthDays = useMemo(() => buildMonth(month), [month]);

  const shiftMonth = (offset) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <section className="calendar-panel">
      <div className="section-heading calendar-heading">
        <h2>PnL Calendar</h2>
        <div className="month-controls">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month"><ChevronLeft size={18} /></button>
          <strong>{monthLabel(month)}</strong>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="weekday-grid">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="calendar-grid">
        {monthDays.map((date) => {
          const key = isoDate(date);
          const pnl = dayMap.get(key);
          const trades = tradesByDay?.[key] || [];
          const profit = Number(pnl?.profit || 0);
          const tone = profit > 0 ? "day-profit" : profit < 0 ? "day-loss" : "";
          const isOutside = date.getMonth() !== month.getMonth();
          const isSelected = selectedDate === key;
          return (
            <button
              type="button"
              key={key}
              className={`calendar-day ${tone} ${isOutside ? "outside" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectDate(key)}
            >
              <span className="day-number">{date.getDate()}</span>
              {pnl ? <strong>{money(profit, currency)}</strong> : <em>-</em>}
              {trades.length > 0 && (
                <span className="day-tooltip">
                  <b>{trades.length} trades</b>
                  {trades.slice(0, 5).map((trade) => (
                    <span key={trade.ticket}>{trade.symbol} {money(trade.net_profit ?? trade.profit, currency)}</span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
