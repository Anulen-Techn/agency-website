import type { RecentWhatsAppLink } from "@/lib/whatsapp/types";

export const whatsappHistoryKey = "anulen-whatsapp-link-history-v1";

export function loadWhatsAppHistory(): RecentWhatsAppLink[] {
  const raw = localStorage.getItem(whatsappHistoryKey);

  if (!raw) return [];

  try {
    return JSON.parse(raw) as RecentWhatsAppLink[];
  } catch {
    localStorage.removeItem(whatsappHistoryKey);
    return [];
  }
}

export function saveWhatsAppHistory(history: RecentWhatsAppLink[]) {
  localStorage.setItem(whatsappHistoryKey, JSON.stringify(history.slice(0, 20)));
}

export function addWhatsAppHistoryEntry(entry: RecentWhatsAppLink) {
  const current = loadWhatsAppHistory().filter((item) => item.link !== entry.link);
  const next = [entry, ...current].slice(0, 20);
  saveWhatsAppHistory(next);
  return next;
}

export function clearWhatsAppHistory() {
  localStorage.removeItem(whatsappHistoryKey);
}
