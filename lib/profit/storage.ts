import type { ProfitInput, ProfitScenario } from "@/lib/profit/types";

export const profitStorageKey = "anulen-profit-calculator-v1";
export const profitScenarioKey = "anulen-profit-scenarios-v1";

export function saveLatestProfitInput(input: ProfitInput) {
  localStorage.setItem(profitStorageKey, JSON.stringify(input));
}

export function loadLatestProfitInput(): ProfitInput | null {
  const raw = localStorage.getItem(profitStorageKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ProfitInput;
  } catch {
    localStorage.removeItem(profitStorageKey);
    return null;
  }
}

export function loadProfitScenarios(): ProfitScenario[] {
  const raw = localStorage.getItem(profitScenarioKey);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as ProfitScenario[];
  } catch {
    localStorage.removeItem(profitScenarioKey);
    return [];
  }
}

export function saveProfitScenarios(scenarios: ProfitScenario[]) {
  localStorage.setItem(profitScenarioKey, JSON.stringify(scenarios.slice(0, 10)));
}

export function clearProfitScenarios() {
  localStorage.removeItem(profitScenarioKey);
}
