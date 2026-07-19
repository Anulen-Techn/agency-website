import type { InvoiceData } from "@/lib/invoice/types";

export const invoiceDraftKey = "anulen.invoice-generator.draft.v1";

export function saveInvoiceDraft(invoice: InvoiceData) {
  localStorage.setItem(invoiceDraftKey, JSON.stringify(invoice));
}

export function loadInvoiceDraft(): InvoiceData | null {
  const rawDraft = localStorage.getItem(invoiceDraftKey);

  if (!rawDraft) return null;

  try {
    return JSON.parse(rawDraft) as InvoiceData;
  } catch {
    localStorage.removeItem(invoiceDraftKey);
    return null;
  }
}

export function clearInvoiceDraft() {
  localStorage.removeItem(invoiceDraftKey);
}
