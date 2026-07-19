import type { ReceiptData, ReceiptTotals } from "@/lib/receipt/types";

export const roundMoney = (value: number) => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

const positive = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

function discountAmount(type: "percentage" | "fixed", value: number, base: number) {
  const raw = type === "percentage" ? base * (positive(value) / 100) : positive(value);
  return roundMoney(Math.min(raw, base));
}

export function calculateReceiptTotals(receipt: ReceiptData): ReceiptTotals {
  if (receipt.simpleMode) {
    const grandTotal = roundMoney(positive(receipt.amountReceived));
    const refundedAmount = roundMoney(Math.min(positive(receipt.refundedAmount), grandTotal));

    return {
      lines: [],
      subtotalBeforeDiscount: grandTotal,
      lineDiscount: 0,
      subtotal: grandTotal,
      tax: 0,
      overallDiscount: 0,
      shipping: 0,
      additionalCharge: 0,
      grandTotal,
      amountReceived: grandTotal,
      balanceDue: 0,
      changeDue: 0,
      refundedAmount,
    };
  }

  const lines = receipt.items.map((item) => {
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
  const overallDiscount = discountAmount(receipt.discountType, receipt.discountValue, subtotal + tax);
  const shipping = roundMoney(positive(receipt.shipping));
  const additionalCharge = roundMoney(positive(receipt.additionalCharge));
  const grandTotal = roundMoney(Math.max(subtotal + tax - overallDiscount + shipping + additionalCharge, 0));
  const amountReceived = roundMoney(positive(receipt.amountReceived));
  const balanceDue = roundMoney(Math.max(grandTotal - amountReceived, 0));
  const changeDue = receipt.status === "Paid" ? roundMoney(Math.max(amountReceived - grandTotal, 0)) : 0;
  const refundedAmount = roundMoney(Math.min(positive(receipt.refundedAmount), amountReceived || grandTotal));

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
    amountReceived,
    balanceDue,
    changeDue,
    refundedAmount,
  };
}
