import type { QuotationData, QuotationTotals } from "@/lib/quotation/types";

export const roundMoney = (value: number) => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

const positive = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

function discountAmount(type: "percentage" | "fixed", value: number, base: number) {
  const raw = type === "percentage" ? base * (positive(value) / 100) : positive(value);
  return roundMoney(Math.min(raw, base));
}

export function calculateQuotationTotals(quotation: QuotationData): QuotationTotals {
  const lines = quotation.items.map((item) => {
    const gross = roundMoney(positive(item.quantity) * positive(item.unitPrice));
    const discount = discountAmount(item.discountType, item.discountValue, gross);
    const subtotal = roundMoney(Math.max(gross - discount, 0));
    const tax = roundMoney(subtotal * (positive(item.taxRate) / 100));

    return {
      id: item.id,
      gross,
      discount,
      subtotal,
      tax,
      total: roundMoney(subtotal + tax),
    };
  });

  const subtotalBeforeDiscount = roundMoney(lines.reduce((sum, line) => sum + line.gross, 0));
  const lineDiscount = roundMoney(lines.reduce((sum, line) => sum + line.discount, 0));
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.subtotal, 0));
  const tax = roundMoney(lines.reduce((sum, line) => sum + line.tax, 0));
  const overallDiscount = discountAmount(quotation.discountType, quotation.discountValue, subtotal + tax);
  const shipping = roundMoney(positive(quotation.shipping));
  const additionalCharge = roundMoney(positive(quotation.additionalCharge));
  const grandTotal = roundMoney(Math.max(subtotal + tax - overallDiscount + shipping + additionalCharge, 0));
  const depositRequired = roundMoney(
    Math.min(quotation.depositType === "percentage" ? grandTotal * (positive(quotation.depositValue) / 100) : positive(quotation.depositValue), grandTotal),
  );
  const balanceAfterDeposit = roundMoney(Math.max(grandTotal - depositRequired, 0));

  return {
    lines,
    subtotalBeforeDiscount,
    lineDiscount,
    subtotal,
    tax,
    overallDiscount,
    shipping,
    additionalCharge,
    grandTotal,
    depositRequired,
    balanceAfterDeposit,
  };
}
