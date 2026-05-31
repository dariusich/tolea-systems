import { useState } from "react";

function money(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function tradeType(trade) {
  return trade.type || trade.action || "Closed";
}

export default function TradesTable({ trades, currency, title = "Trades", totalCount, limit = 8 }) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? trades : trades?.slice(0, limit);
  const count = totalCount ?? trades?.length ?? 0;

  return (
    <section className="table-panel">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>{count} rows</span>
      </div>
      {!trades?.length ? (
        <div className="empty-panel">No trades in this selection.</div>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Volume</th>
                  <th>Profit</th>
                  <th>Close Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((trade) => {
                  const tradeNet = Number(trade.net_profit ?? Number(trade.profit || 0) + Number(trade.swap || 0) + Number(trade.commission || 0));
                  return (
                    <tr key={`${trade.account_id}-${trade.ticket}`}>
                      <td>{trade.ticket}</td>
                      <td><strong>{trade.symbol}</strong></td>
                      <td>{tradeType(trade)}</td>
                      <td>{Number(trade.volume || 0).toFixed(2)}</td>
                      <td className={tradeNet >= 0 ? "positive" : "negative"}>{money(tradeNet, currency)}</td>
                      <td>{formatDate(trade.close_time)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {trades.length > limit && (
            <button className="table-more" type="button" onClick={() => setExpanded((value) => !value)}>
              {expanded ? "Show latest trades" : "View all trades"}
            </button>
          )}
        </>
      )}
    </section>
  );
}
