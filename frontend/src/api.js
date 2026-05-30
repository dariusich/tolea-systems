const API_BASE =
  import.meta.env.VITE_API_URL ||
  window.tradeJournalApiBase ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000" : window.location.origin);

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) {
    let detail = `API request failed (${response.status})`;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // Keep the generic detail.
    }
    throw new Error(detail);
  }
  return response.json();
}

function root(token) {
  return token ? `/public/${encodeURIComponent(token)}` : "";
}

export const tradeApi = {
  accounts: (token) => request(`${root(token)}/accounts`),
  account: (token, slug) => request(`${root(token)}/accounts/${encodeURIComponent(slug)}`),
  trades: (token, slug, date) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    return request(`${root(token)}/accounts/${encodeURIComponent(slug)}/trades${query}`);
  },
  stats: (token, slug) => request(`${root(token)}/accounts/${encodeURIComponent(slug)}/stats`),
  dailyPnl: (token, slug) => request(`${root(token)}/accounts/${encodeURIComponent(slug)}/pnl/daily`),
  equity: (token, slug) => request(`${root(token)}/accounts/${encodeURIComponent(slug)}/equity`)
};
