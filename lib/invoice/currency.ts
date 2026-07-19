import type { CurrencyCode } from "@/lib/invoice/types";

export const currencies: Array<{ code: CurrencyCode; label: string; symbol: string }> = [
  { code: "NGN", label: "Nigerian naira", symbol: "₦" },
  { code: "USD", label: "US dollar", symbol: "$" },
  { code: "GBP", label: "British pound", symbol: "£" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "CAD", label: "Canadian dollar", symbol: "C$" },
  { code: "GHS", label: "Ghanaian cedi", symbol: "GH₵" },
  { code: "ZAR", label: "South African rand", symbol: "R" },
];

export function formatMoney(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}
