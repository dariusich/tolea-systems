import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

function money(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export default function EquityCurve({ data, currency }) {
  if (!data?.length) {
    return <div className="empty-panel">No closed trades yet.</div>;
  }

  return (
    <section className="chart-panel">
      <div className="section-heading">
        <h2>Equity Curve</h2>
        <span>Last {Math.min(data.length, 30)} closed trades</span>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 18, bottom: 6, left: 0 }}>
            <defs>
              <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eceff3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={28} stroke="#9aa3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9aa3af" width={76} tickFormatter={(value) => money(value, currency)} />
            <Tooltip
              formatter={(value, name) => [money(value, currency), name === "equity" ? "Cumulative PnL" : name]}
              labelFormatter={(label) => `Date ${label}`}
              contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb", boxShadow: "0 18px 50px rgba(15,23,42,.12)" }}
            />
            <Area type="monotone" dataKey="equity" stroke="#16a34a" strokeWidth={3} fill="url(#equityFill)" dot={false} activeDot={{ r: 5, fill: "#16a34a" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
