import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { money } from "@/lib/format";

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function ymd(d) {
  return d.toISOString().slice(0, 10);
}

export default function PnLCalendar({ days = [] }) {
  const byDate = useMemo(() => {
    const map = new Map();
    for (const d of days) map.set(d.date, d.profit);
    return map;
  }, [days]);

  // initial month: latest one present
  const latestDate = useMemo(() => {
    if (!days.length) return new Date();
    return new Date(days[days.length - 1].date);
  }, [days]);
  const [cursor, setCursor] = useState(() => startOfMonth(latestDate));

  const cells = useMemo(() => buildMonthGrid(cursor, byDate), [cursor, byDate]);

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const monthlySummary = cells
    .filter((c) => c.inMonth && c.profit != null)
    .reduce(
      (acc, c) => {
        acc.total += c.profit;
        if (c.profit > 0) acc.winDays += 1;
        else if (c.profit < 0) acc.lossDays += 1;
        return acc;
      },
      { total: 0, winDays: 0, lossDays: 0 }
    );

  const maxAbs = Math.max(
    1,
    ...cells.map((c) => Math.abs(c.profit || 0))
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7" data-testid="pnl-calendar">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">PnL Calendar</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">{monthLabel}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            data-testid="pnl-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            data-testid="pnl-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[11px] uppercase tracking-[0.14em] text-zinc-400">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => (
          <DayCell key={i} cell={cell} maxAbs={maxAbs} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-5 text-sm">
        <Summary label="Monthly P&L" value={money(monthlySummary.total)} tone={monthlySummary.total >= 0 ? "profit" : "loss"} />
        <Summary label="Winning days" value={monthlySummary.winDays} tone="profit" />
        <Summary label="Losing days" value={monthlySummary.lossDays} tone="loss" />
      </div>
    </div>
  );
}

function buildMonthGrid(monthStart, byDate) {
  const cells = [];
  const firstDow = (monthStart.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();

  // leading blanks
  for (let i = 0; i < firstDow; i++) {
    const d = new Date(monthStart);
    d.setDate(-firstDow + i + 1);
    cells.push({ date: d, profit: byDate.get(ymd(d)) ?? null, inMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), i);
    cells.push({ date: d, profit: byDate.get(ymd(d)) ?? null, inMonth: true });
  }
  // trailing blanks to complete 6 rows = 42 cells
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, profit: byDate.get(ymd(d)) ?? null, inMonth: false });
  }
  return cells;
}

function DayCell({ cell, maxAbs }) {
  const { date, profit, inMonth } = cell;
  const positive = profit != null && profit > 0;
  const negative = profit != null && profit < 0;
  const intensity = profit != null ? Math.min(1, Math.abs(profit) / maxAbs) : 0;

  const bg = !inMonth
    ? "bg-zinc-50/50 text-zinc-300"
    : positive
      ? `text-emerald-700`
      : negative
        ? `text-rose-700`
        : "text-zinc-400";

  const fill = positive
    ? `rgba(16, 185, 129, ${0.08 + intensity * 0.32})`
    : negative
      ? `rgba(220, 38, 38, ${0.08 + intensity * 0.32})`
      : "transparent";
  const profitText =
    profit == null
      ? ""
      : Math.abs(profit) >= 1000
        ? `${(profit / 1000).toFixed(1)}k`
        : Math.abs(profit) < 1
          ? profit.toFixed(2)
          : profit.toFixed(0);

  return (
    <div
      className={`group relative aspect-square min-h-[44px] rounded-md border border-zinc-100 p-1.5 text-[10px] leading-3 ${bg}`}
      style={{ background: fill }}
    >
      <span className="opacity-70">{date.getDate()}</span>
      {profit != null && (
        <span className={`absolute bottom-1.5 right-1.5 text-[11px] font-medium ${positive ? "text-emerald-700" : negative ? "text-rose-700" : "text-zinc-500"}`}>
          {positive ? "+" : ""}
          {profitText}
        </span>
      )}
    </div>
  );
}

function Summary({ label, value, tone }) {
  const cls = tone === "profit" ? "text-emerald-600" : tone === "loss" ? "text-rose-600" : "text-zinc-900";
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-base font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
