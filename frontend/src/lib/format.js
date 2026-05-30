export const money = (n, currency = "USD") => {
  const num = Number(n) || 0;
  const fractionDigits = Number.isInteger(num) ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);
};

export const moneyDecimal = (n, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(n) || 0);

export const percent = (n, digits = 2) => `${(Number(n) || 0).toFixed(digits)}%`;

export const number = (n) => new Intl.NumberFormat("en-US").format(Number(n) || 0);

export const shortDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const monthYear = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
