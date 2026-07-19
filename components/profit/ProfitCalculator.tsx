"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Printer, RotateCcw, Share2, Trash2 } from "lucide-react";
import { currencies, formatMoney } from "@/lib/invoice/currency";
import type { CurrencyCode } from "@/lib/invoice/types";
import { calculateProfit } from "@/lib/profit/calculations";
import { clearProfitScenarios, loadLatestProfitInput, loadProfitScenarios, saveLatestProfitInput, saveProfitScenarios } from "@/lib/profit/storage";
import type { ProfitInput, ProfitMode, ProfitScenario } from "@/lib/profit/types";
import AdSenseAd from "@/components/ads/AdSenseAd";
import { ADSENSE_SLOTS } from "@/lib/adsense";

const modes: Array<{ value: ProfitMode; label: string }> = [
  { value: "basic", label: "Basic Profit Calculator" },
  { value: "advanced", label: "Advanced Profit Calculator" },
  { value: "target-price", label: "Target Selling Price Calculator" },
  { value: "target-profit", label: "Target Profit Calculator" },
  { value: "break-even", label: "Break-Even Calculator" },
];

const defaultInput: ProfitInput = {
  mode: "basic",
  currency: "NGN",
  scenarioName: "",
  costPrice: 0,
  sellingPrice: 0,
  quantity: 1,
  fixedExpenses: 0,
  variableExpensePerItem: 0,
  shipping: 0,
  advertising: 0,
  processingFee: 0,
  tax: 0,
  discount: 0,
  otherExpenses: 0,
  desiredMargin: 20,
  desiredTotalProfit: 0,
};

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export default function ProfitCalculator() {
  const [input, setInput] = useState<ProfitInput>(defaultInput);
  const [scenarios, setScenarios] = useState<ProfitScenario[]>([]);
  const [notice, setNotice] = useState("");

  const result = useMemo(() => calculateProfit(input), [input]);
  const totalBreakdown = result.breakdown.reduce((sum, item) => sum + item.amount, 0);
  const summary = `Revenue: ${formatMoney(result.netRevenue, input.currency)}
Total costs: ${formatMoney(result.totalCosts, input.currency)}
Net profit: ${formatMoney(result.netProfit, input.currency)}
Profit margin: ${result.profitMargin.toFixed(2)}%
Markup: ${result.markup.toFixed(2)}%
Currency: ${input.currency}`;

  useEffect(() => {
    const saved = loadLatestProfitInput();
    if (saved) setInput({ ...defaultInput, ...saved });
    setScenarios(loadProfitScenarios());
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => saveLatestProfitInput(input), 500);
    return () => window.clearTimeout(timer);
  }, [input]);

  const update = <K extends keyof ProfitInput>(key: K, value: ProfitInput[K]) => setInput((current) => ({ ...current, [key]: value }));
  const updateNumber = (key: keyof ProfitInput, value: number) => update(key, Math.max(Number.isFinite(value) ? value : 0, 0) as never);

  const showNotice = (value: string) => {
    setNotice(value);
    window.setTimeout(() => setNotice(""), 2500);
  };

  const saveScenario = () => {
    const entry: ProfitScenario = {
      id: makeId(),
      input,
      result,
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...scenarios].slice(0, 10);
    setScenarios(next);
    saveProfitScenarios(next);
    showNotice("Scenario saved.");
  };

  const duplicateScenario = (scenario: ProfitScenario) => {
    const next = [{ ...scenario, id: makeId(), input: { ...scenario.input, scenarioName: `${scenario.input.scenarioName || "Scenario"} copy` }, createdAt: new Date().toISOString() }, ...scenarios].slice(0, 10);
    setScenarios(next);
    saveProfitScenarios(next);
  };

  const deleteScenario = (id: string) => {
    const next = scenarios.filter((scenario) => scenario.id !== id);
    setScenarios(next);
    saveProfitScenarios(next);
  };

  const clearSaved = () => {
    if (!scenarios.length || !window.confirm("Clear all saved profit scenarios?")) return;
    setScenarios([]);
    clearProfitScenarios();
  };

  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      showNotice("Results copied.");
    } catch {
      showNotice("Copy failed. Select the results and copy manually.");
    }
  };

  const shareResults = async () => {
    if (!navigator.share) {
      await copyResults();
      return;
    }
    try {
      await navigator.share({ title: "Profit calculation", text: summary });
    } catch {
      showNotice("Share cancelled.");
    }
  };

  const reset = () => {
    if (!window.confirm("Reset the calculator? Saved scenarios will stay.")) return;
    setInput(defaultInput);
  };

  return (
    <>
      <section className="profit-no-print px-6 pb-4 pt-4 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#589037]">Profit Calculator</p>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button onClick={saveScenario} className="inline-flex items-center gap-3 rounded-full border border-black px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
              <Check size={17} />
              Save scenario
            </button>
            <button onClick={reset} className="inline-flex items-center gap-3 rounded-full border border-black/20 px-5 py-3 text-sm font-bold transition hover:border-red-600 hover:text-red-600 dark:border-white/30">
              <RotateCcw size={17} />
              Reset
            </button>
          </div>
          {notice && (
            <div className="mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-black/10 bg-[#f7f7f4] p-4 text-sm dark:border-white/10 dark:bg-white/10" role="status" aria-live="polite">
              <Check size={18} className="mt-0.5 shrink-0 text-[#589037]" />
              <p>{notice}</p>
            </div>
          )}
        </div>
      </section>

      <AdSenseAd slot={ADSENSE_SLOTS.top} />

      <section className="px-3 pb-10 dark:bg-black">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2 lg:items-start">
          <div className="profit-no-print grid gap-5 rounded-[2rem] bg-white p-4 shadow-sm dark:bg-black md:p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <Panel title="Calculator mode">
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField id="mode" label="Mode" value={input.mode} onChange={(value) => update("mode", value as ProfitMode)} options={modes.map((mode) => mode.label)} optionValues={modes.map((mode) => mode.value)} />
                <SelectField id="currency" label="Currency" value={input.currency} onChange={(value) => update("currency", value as CurrencyCode)} options={currencies.map((currency) => `${currency.code} - ${currency.label}`)} optionValues={currencies.map((currency) => currency.code)} />
                <TextField id="scenarioName" label="Scenario name" value={input.scenarioName} onChange={(value) => update("scenarioName", value)} placeholder="Scenario A" />
              </div>
            </Panel>

            <Panel title="Inputs">
              <div className="grid gap-4 md:grid-cols-2">
                {input.mode !== "break-even" && <NumberField id="costPrice" label="Cost price per item" value={input.costPrice} onChange={(value) => updateNumber("costPrice", value)} />}
                {input.mode !== "target-price" && <NumberField id="sellingPrice" label="Selling price per item" value={input.sellingPrice} onChange={(value) => updateNumber("sellingPrice", value)} />}
                {input.mode !== "target-profit" && <NumberField id="quantity" label="Quantity sold" value={input.quantity} onChange={(value) => updateNumber("quantity", value)} min="0" />}
                {input.mode === "target-price" && <NumberField id="desiredMargin" label="Desired profit margin %" value={input.desiredMargin} onChange={(value) => updateNumber("desiredMargin", value)} />}
                {input.mode === "target-profit" && <NumberField id="desiredTotalProfit" label="Desired total profit" value={input.desiredTotalProfit} onChange={(value) => updateNumber("desiredTotalProfit", value)} />}
                {input.mode !== "basic" && <NumberField id="fixedExpenses" label="Fixed expenses" value={input.fixedExpenses} onChange={(value) => updateNumber("fixedExpenses", value)} />}
                {["advanced", "break-even", "target-price"].includes(input.mode) && <NumberField id="variableExpensePerItem" label="Variable expense per item" value={input.variableExpensePerItem} onChange={(value) => updateNumber("variableExpensePerItem", value)} />}
                {input.mode === "break-even" && <NumberField id="costPriceBreakEven" label="Cost per item" value={input.costPrice} onChange={(value) => updateNumber("costPrice", value)} />}
              </div>
            </Panel>

            {input.mode === "advanced" && (
              <Panel title="Additional costs">
                <div className="grid gap-4 md:grid-cols-2">
                  <NumberField id="shipping" label="Shipping or delivery cost" value={input.shipping} onChange={(value) => updateNumber("shipping", value)} />
                  <NumberField id="advertising" label="Advertising cost" value={input.advertising} onChange={(value) => updateNumber("advertising", value)} />
                  <NumberField id="processingFee" label="Payment-processing fees" value={input.processingFee} onChange={(value) => updateNumber("processingFee", value)} />
                  <NumberField id="tax" label="Tax" value={input.tax} onChange={(value) => updateNumber("tax", value)} />
                  <NumberField id="discount" label="Discount amount" value={input.discount} onChange={(value) => updateNumber("discount", value)} />
                  <NumberField id="otherExpenses" label="Other costs" value={input.otherExpenses} onChange={(value) => updateNumber("otherExpenses", value)} />
                </div>
              </Panel>
            )}

            <Panel title="Saved scenarios">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-neutral-500 dark:text-neutral-300">Save up to 10 scenarios and compare pricing options.</p>
                <button onClick={clearSaved} className="rounded-full border border-black/20 px-4 py-2 text-xs font-bold text-red-600 dark:border-white/20">
                  Clear saved
                </button>
              </div>
              <div className="mt-5 grid gap-3">
                {scenarios.length ? (
                  scenarios.map((scenario) => (
                    <article key={scenario.id} className="rounded-[1.25rem] bg-[#f7f7f4] p-4 dark:bg-white/10">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{scenario.input.scenarioName || "Saved scenario"}</p>
                          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-300">
                            Net profit: {formatMoney(scenario.result.netProfit, scenario.input.currency)} | Margin: {scenario.result.profitMargin.toFixed(2)}%
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setInput(scenario.input)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold dark:border-white/10">Load</button>
                          <button onClick={() => duplicateScenario(scenario)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold dark:border-white/10">Duplicate</button>
                          <button onClick={() => deleteScenario(scenario.id)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold text-red-600 dark:border-white/10">Delete</button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm text-neutral-500 dark:bg-white/10 dark:text-neutral-300">No saved scenarios yet.</p>
                )}
              </div>
            </Panel>

            {scenarios.length >= 2 && (
              <Panel title="Scenario comparison">
                <div className="grid gap-3">
                  {scenarios.slice(0, 4).map((scenario) => (
                    <div key={scenario.id} className="rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm dark:bg-white/10">
                      <p className="font-black">{scenario.input.scenarioName || "Scenario"}</p>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        <span>Revenue: {formatMoney(scenario.result.netRevenue, scenario.input.currency)}</span>
                        <span>Net profit: {formatMoney(scenario.result.netProfit, scenario.input.currency)}</span>
                        <span>Margin: {scenario.result.profitMargin.toFixed(2)}%</span>
                        <span>Markup: {scenario.result.markup.toFixed(2)}%</span>
                        <span>Break-even qty: {scenario.result.breakEvenQuantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-neutral-500 dark:text-neutral-300">Higher price does not automatically mean the best business decision. Consider demand, positioning and customer value.</p>
              </Panel>
            )}

            <div className="rounded-[1.5rem] bg-[#f7f7f4] p-5 text-sm leading-7 text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
              Privacy note: calculations and saved scenarios stay in this browser. This calculator provides estimates and is not accounting, tax or
              financial advice.
            </div>
          </div>

          <div className="profit-preview-scroll lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <section className="profit-print-area rounded-[2rem] bg-white p-4 shadow-sm dark:bg-black md:p-6">
              <div className="rounded-[1.5rem] bg-black p-6 text-white dark:bg-white dark:text-black">
                <p className="text-sm font-bold text-[#8bc75d]">Main result</p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">{formatMoney(result.netProfit, input.currency)}</h2>
                <p className="mt-3 text-sm">{result.status}: {result.interpretation}</p>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Result label="Revenue" value={formatMoney(result.netRevenue, input.currency)} />
                <Result label="Total costs" value={formatMoney(result.totalCosts, input.currency)} />
                <Result label="Gross profit" value={formatMoney(result.grossProfit, input.currency)} />
                <Result label="Net profit" value={formatMoney(result.netProfit, input.currency)} />
                <Result label="Profit per item" value={formatMoney(result.profitPerItem, input.currency)} />
                <Result label="Profit margin" value={`${result.profitMargin.toFixed(2)}%`} help="Net profit divided by net revenue." />
                <Result label="Markup" value={`${result.markup.toFixed(2)}%`} help="Profit per item divided by cost per item." />
                <Result label="ROI" value={`${result.roi.toFixed(2)}%`} help="Net profit divided by total investment." />
                <Result label="Break-even quantity" value={String(result.breakEvenQuantity)} help="Units needed to cover estimated fixed costs." />
                <Result label="Break-even selling price" value={formatMoney(result.breakEvenSellingPrice, input.currency)} />
                {input.mode === "target-price" && <Result label="Target selling price" value={formatMoney(result.targetSellingPrice, input.currency)} />}
                {input.mode === "target-profit" && <Result label="Target quantity" value={String(result.targetQuantity)} />}
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-[#f7f7f4] p-5 dark:bg-white/10">
                <h3 className="text-xl font-black tracking-[-0.04em]">Cost breakdown</h3>
                <div className="mt-5 grid gap-3">
                  {result.breakdown.length ? (
                    result.breakdown.map((item) => {
                      const width = totalBreakdown > 0 ? `${Math.max((item.amount / totalBreakdown) * 100, 3)}%` : "0%";
                      return (
                        <div key={item.label}>
                          <div className="mb-2 flex justify-between gap-4 text-sm">
                            <span>{item.label}</span>
                            <span>{formatMoney(item.amount, input.currency)}</span>
                          </div>
                          <div className="h-3 rounded-full bg-white dark:bg-black">
                            <div className="h-3 rounded-full bg-[#589037]" style={{ width }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">Enter costs to see a breakdown.</p>
                  )}
                </div>
              </div>

              <div className="profit-no-print mt-5 flex flex-wrap gap-3">
                <button onClick={copyResults} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-black">
                  <Copy size={16} />
                  Copy results
                </button>
                <button onClick={shareResults} className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold dark:border-white">
                  <Share2 size={16} />
                  Share
                </button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold dark:border-white">
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </section>
          </div>
        </div>
      </section>

      <AdSenseAd slot={ADSENSE_SLOTS.middle} />
    </>
  );
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#589037] focus:ring-2 focus:ring-[#589037]/20 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-neutral-500";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-black">
      <h2 className="mb-5 text-2xl font-black tracking-[-0.04em]">{title}</h2>
      {children}
    </section>
  );
}

function TextField({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>{label}</label>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} placeholder={placeholder} />
    </div>
  );
}

function NumberField({ id, label, value, onChange, min = "0" }: { id: string; label: string; value: number; onChange: (value: number) => void; min?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>{label}</label>
      <input id={id} type="number" value={value} min={min} step="0.01" onChange={(event) => onChange(Number.isFinite(Number(event.target.value)) ? Number(event.target.value) : 0)} className={inputClass} />
    </div>
  );
}

function SelectField({ id, label, value, onChange, options, optionValues }: { id: string; label: string; value: string; onChange: (value: string) => void; options: string[]; optionValues?: string[] }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map((option, index) => (
          <option key={optionValues?.[index] || option} value={optionValues?.[index] || option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function Result({ label, value, help }: { label: string; value: string; help?: string }) {
  return (
    <div className="rounded-[1.25rem] bg-[#f7f7f4] p-4 dark:bg-white/10">
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-300">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
      {help && <p className="mt-2 text-xs leading-5 text-neutral-500 dark:text-neutral-300">{help}</p>}
    </div>
  );
}
