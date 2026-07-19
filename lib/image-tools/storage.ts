import type { ImageToolPreferences } from "./types";

const key = "anulen-image-tools-preferences-v1";

export function loadImageToolPreferences(): Partial<ImageToolPreferences> | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as Partial<ImageToolPreferences>) : null;
  } catch {
    return null;
  }
}

export function saveImageToolPreferences(preferences: ImageToolPreferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(preferences));
  } catch {
    // Preferences are optional. Ignore storage quota and private-mode failures.
  }
}
