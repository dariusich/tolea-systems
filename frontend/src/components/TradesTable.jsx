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

export default function TradesTable({ trades, currency, title = "Trades" }) {
  return (
    <section className="table-panel">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>{trades?.length || 0} rows</span>
      </div>
      {!trades?.length ? (
        <div className="empty-panel">No trades in this selection.</div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Symbol</th>
                <th>Volume</th>
                <th>Profit</th>
                <th>Net</th>
                <th>Close Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => {
                const net = Number(trade.net_profit ?? trade.profit + trade.swap + trade.commission);
                return (
                  <tr key={`${trade.account_id}-${trade.ticket}`}>
                    <td>{trade.ticket}</td>
                    <td><strong>{trade.symbol}</strong></td>
                    <td>{Number(trade.volume || 0).toFixed(2)}</td>
                    <td>{money(trade.profit, currency)}</td>
                    <td className={net >= 0 ? "positive" : "negative"}>{money(net, currency)}</td>
                    <td>{formatDate(trade.close_time)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
