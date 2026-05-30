import {
  CartesianGrid,
  Line,
  LineChart,
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
        <span>{data.length} points</span>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="#e5e0d6" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={28} stroke="#7d7468" />
            <YAxis tick={{ fontSize: 11 }} stroke="#7d7468" width={72} tickFormatter={(value) => money(value, currency)} />
            <Tooltip
              formatter={(value, name) => [money(value, currency), name === "equity" ? "Cumulative PnL" : name]}
              labelFormatter={(label) => `Date ${label}`}
              contentStyle={{ borderRadius: 8, borderColor: "#d8d0c2" }}
            />
            <Line type="monotone" dataKey="equity" stroke="#256f5b" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

