import type { QrHistoryEntry } from "@/lib/qr/types";

export const qrHistoryKey = "anulen-qr-code-history-v1";

export function loadQrHistory(): QrHistoryEntry[] {
  const raw = localStorage.getItem(qrHistoryKey);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as QrHistoryEntry[];
  } catch {
    localStorage.removeItem(qrHistoryKey);
    return [];
  }
}

export function saveQrHistory(history: QrHistoryEntry[]) {
  localStorage.setItem(qrHistoryKey, JSON.stringify(history.slice(0, 20)));
}

export function addQrHistoryEntry(entry: QrHistoryEntry) {
  const current = loadQrHistory().filter((item) => item.encodedContent !== entry.encodedContent);
  const next = [entry, ...current].slice(0, 20);
  saveQrHistory(next);
  return next;
}

export function clearQrHistory() {
  localStorage.removeItem(qrHistoryKey);
}
