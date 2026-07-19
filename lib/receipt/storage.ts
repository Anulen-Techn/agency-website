import type { ReceiptData } from "@/lib/receipt/types";

export const receiptDraftKey = "anulen-receipt-generator-draft-v1";

export function saveReceiptDraft(receipt: ReceiptData) {
  localStorage.setItem(receiptDraftKey, JSON.stringify(receipt));
}

export function loadReceiptDraft(): ReceiptData | null {
  const rawDraft = localStorage.getItem(receiptDraftKey);

  if (!rawDraft) return null;

  try {
    return JSON.parse(rawDraft) as ReceiptData;
  } catch {
    localStorage.removeItem(receiptDraftKey);
    return null;
  }
}

export function clearReceiptDraft() {
  localStorage.removeItem(receiptDraftKey);
}
