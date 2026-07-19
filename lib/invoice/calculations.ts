import type { InvoiceData, InvoiceTotals } from "@/lib/invoice/types";

const roundMoney = (value: number) => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
const positive = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

export function calculateInvoiceTotals(invoice: InvoiceData): InvoiceTotals {
  const lines = invoice.items.map((item) => {
    const subtotal = roundMoney(positive(item.quantity) * positive(item.unitPrice));
    const tax = roundMoney(subtotal * (positive(item.taxRate) / 100));

    return {
      id: item.id,
      subtotal,
      tax,
      total: roundMoney(subtotal + tax),
    };
  });

  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.subtotal, 0));
  const tax = roundMoney(lines.reduce((sum, line) => sum + line.tax, 0));
  const rawDiscount =
    invoice.discountType === "percentage" ? subtotal * (positive(invoice.discountValue) / 100) : positive(invoice.discountValue);
  const discount = roundMoney(Math.min(rawDiscount, subtotal + tax));
  const shipping = roundMoney(positive(invoice.shipping));
  const grandTotal = roundMoney(Math.max(subtotal + tax - discount + shipping, 0));
  const amountPaid = roundMoney(Math.min(positive(invoice.amountPaid), grandTotal));
  const balanceDue = roundMoney(Math.max(grandTotal - amountPaid, 0));

  return {
    lines,
    subtotal,
    discount,
    tax,
    shipping,
    grandTotal,
    amountPaid,
    balanceDue,
  };
}
