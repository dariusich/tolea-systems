import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { money, shortDate } from "@/lib/format";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-zinc-900">{shortDate(p.date)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-1 text-zinc-600">
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full"
            style={{ background: entry.stroke || entry.fill }}
          />
          {entry.name}: <span className="font-medium text-zinc-900">{money(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function EquityChart({ data, height = 280, showBalance = true }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#F4F4F5" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="#A1A1AA"
          interval="preserveStartEnd"
          minTickGap={32}
        />
        <YAxis
          tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="#A1A1AA"
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="balance"
          name="Balance"
          stroke="#2563EB"
          strokeWidth={2}
          fill="url(#equityGrad)"
        />
        {showBalance && (
          <Line type="monotone" dataKey="equity" name="Equity" stroke="#94A3B8" strokeWidth={1} dot={false} strokeDasharray="3 3" />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DrawdownChart({ data, height = 200 }) {
  // Convert to negative for visual depth
  const dd = data.map((p) => ({ date: p.date, drawdown: -Math.abs(p.drawdown || 0) }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={dd} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC2626" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#F4F4F5" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="#A1A1AA"
          interval="preserveStartEnd"
          minTickGap={32}
        />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="#A1A1AA"
          width={48}
        />
        <ReferenceLine y={0} stroke="#E4E4E7" />
        <Tooltip
          formatter={(v) => [`${(v).toFixed(2)}%`, "Drawdown"]}
          labelFormatter={(v) => shortDate(v)}
          contentStyle={{ borderRadius: 8, border: "1px solid #E4E4E7", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", fontSize: 12 }}
        />
        <Area type="monotone" dataKey="drawdown" stroke="#DC2626" strokeWidth={1.5} fill="url(#ddGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MiniSpark({ data, color = "#2563EB", height = 48 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="balance" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
