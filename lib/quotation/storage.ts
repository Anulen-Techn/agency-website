import type { QuotationData } from "@/lib/quotation/types";

export const quotationDraftKey = "anulen-quotation-generator-draft-v1";

export function saveQuotationDraft(quotation: QuotationData) {
  localStorage.setItem(quotationDraftKey, JSON.stringify(quotation));
}

export function loadQuotationDraft(): QuotationData | null {
  const rawDraft = localStorage.getItem(quotationDraftKey);

  if (!rawDraft) return null;

  try {
    return JSON.parse(rawDraft) as QuotationData;
  } catch {
    localStorage.removeItem(quotationDraftKey);
    return null;
  }
}

export function clearQuotationDraft() {
  localStorage.removeItem(quotationDraftKey);
}
