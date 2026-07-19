"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Copy, Download, FileText, Plus, Printer, RotateCcw, Save, Send, Trash2, Upload, X } from "lucide-react";
import QuotationPreview from "@/components/quotation/QuotationPreview";
import { calculateQuotationTotals } from "@/lib/quotation/calculations";
import { currencies, formatMoney } from "@/lib/invoice/currency";
import { downloadQuotationPdf } from "@/lib/quotation/pdf";
import { generateQuotationNumber } from "@/lib/quotation/quotationNumber";
import { clearQuotationDraft, loadQuotationDraft, saveQuotationDraft } from "@/lib/quotation/storage";
import { quotationToInvoiceDraft } from "@/lib/quotation/toInvoice";
import type { DepositType, QuotationData, QuotationItem, QuotationStatus, QuotationTemplate, QuotationValidationErrors } from "@/lib/quotation/types";
import type { CurrencyCode, DiscountType } from "@/lib/invoice/types";
import { invoiceDraftKey, saveInvoiceDraft } from "@/lib/invoice/storage";
import { validateQuotation } from "@/lib/quotation/validation";
import AdSenseAd from "@/components/ads/AdSenseAd";
import { ADSENSE_SLOTS } from "@/lib/adsense";

const maxLogoSize = 2_000_000;
const accentColors = [
  { name: "Anulen green", value: "#589037" },
  { name: "Blue", value: "#2563eb" },
  { name: "Slate", value: "#475569" },
  { name: "Black", value: "#111111" },
  { name: "Gold", value: "#b7791f" },
];
const units = ["Item", "Hour", "Day", "Week", "Month", "Service", "Package", "Kilogram", "Piece", "Custom"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function makeItem(): QuotationItem {
  return {
    id: makeId(),
    name: "",
    description: "",
    quantity: 1,
    unit: "Service",
    unitPrice: 0,
    discountType: "percentage",
    discountValue: 0,
    taxRate: 0,
  };
}

function makeEmptyQuotation(): QuotationData {
  return {
    businessName: "",
    businessLogo: "",
    businessAddress: "",
    businessEmail: "",
    businessPhone: "",
    businessWebsite: "",
    businessTaxId: "",
    businessRegistrationNumber: "",
    businessInfo: "",
    customerName: "",
    contactPerson: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerTaxId: "",
    quotationNumber: generateQuotationNumber(),
    issueDate: today(),
    validUntil: futureDate(14),
    reference: "",
    salesRepresentative: "",
    projectName: "",
    status: "Draft",
    currency: "NGN",
    discountType: "percentage",
    discountValue: 0,
    shipping: 0,
    additionalCharge: 0,
    depositType: "percentage",
    depositValue: 0,
    introductoryMessage: "Thank you for the opportunity to provide this quotation. Please review the products and services listed below.",
    notes: "",
    terms: "",
    deliveryTimeline: "",
    estimatedCompletionTime: "",
    warrantyInformation: "",
    paymentTerms: "",
    bankDetails: "",
    paymentLink: "",
    acceptanceInstructions: "I accept this quotation and authorize the work described above.",
    showAcceptance: true,
    template: "modern",
    accentColor: "#589037",
    items: [makeItem()],
  };
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasEnteredData(quotation: QuotationData) {
  const empty = makeEmptyQuotation();
  return JSON.stringify({ ...quotation, quotationNumber: "", issueDate: "", validUntil: "", items: [] }) !== JSON.stringify({ ...empty, quotationNumber: "", issueDate: "", validUntil: "", items: [] });
}

function FieldError({ id, errors }: { id: string; errors: QuotationValidationErrors }) {
  if (!errors[id]) return null;

  return <p className="mt-2 text-xs leading-5 text-red-600">{errors[id]}</p>;
}

export default function QuotationGenerator() {
  const router = useRouter();
  const [quotation, setQuotation] = useState<QuotationData>(() => makeEmptyQuotation());
  const [errors, setErrors] = useState<QuotationValidationErrors>({});
  const [notice, setNotice] = useState("");
  const [logoError, setLogoError] = useState("");
  const [saveState, setSaveState] = useState("Draft not saved yet");
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const totals = useMemo(() => calculateQuotationTotals(quotation), [quotation]);
  const colorPickerValue = /^#[0-9a-fA-F]{6}$/.test(quotation.accentColor) ? quotation.accentColor : "#589037";

  useEffect(() => {
    const savedDraft = loadQuotationDraft();
    if (savedDraft) {
      setQuotation({ ...makeEmptyQuotation(), ...savedDraft, items: savedDraft.items?.length ? savedDraft.items : [makeItem()] });
      setNotice("Saved quotation draft restored.");
      setSaveState("Draft restored");
    }
    setHasLoadedDraft(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedDraft) return;

    setSaveState("Saving...");
    const timer = window.setTimeout(() => {
      saveQuotationDraft(quotation);
      setSaveState("Draft saved");
    }, 800);

    return () => window.clearTimeout(timer);
  }, [hasLoadedDraft, quotation]);

  const updateQuotation = <K extends keyof QuotationData>(key: K, value: QuotationData[K]) => {
    setQuotation((current) => ({ ...current, [key]: value }));
  };

  const updateItem = <K extends keyof QuotationItem>(id: string, key: K, value: QuotationItem[K]) => {
    setQuotation((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  };

  const addItem = () => {
    setQuotation((current) => ({ ...current, items: [...current.items, makeItem()] }));
  };

  const duplicateItem = (id: string) => {
    setQuotation((current) => {
      const source = current.items.find((item) => item.id === id);
      if (!source) return current;
      return { ...current, items: [...current.items, { ...source, id: makeId() }] };
    });
  };

  const removeItem = (id: string) => {
    setQuotation((current) => (current.items.length === 1 ? current : { ...current, items: current.items.filter((item) => item.id !== id) }));
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setLogoError("");

    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setLogoError("Upload a PNG, JPG, JPEG or WebP logo.");
      return;
    }

    if (file.size > maxLogoSize) {
      setLogoError("Logo must be 2MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateQuotation("businessLogo", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveDraft = () => {
    saveQuotationDraft(quotation);
    setSaveState("Draft saved");
    setNotice("Quotation draft saved on this browser.");
  };

  const clearQuotation = () => {
    if (hasEnteredData(quotation) && !window.confirm("Clear this quotation and remove the saved draft?")) return;

    clearQuotationDraft();
    setQuotation(makeEmptyQuotation());
    setErrors({});
    setLogoError("");
    setNotice("Quotation cleared.");
    setSaveState("Draft not saved yet");
  };

  const startNewQuotation = () => {
    const keepBusiness = window.confirm("Start a new quotation and keep your business details?");
    const next = makeEmptyQuotation();

    if (keepBusiness) {
      setQuotation((current) => ({
        ...next,
        businessName: current.businessName,
        businessLogo: current.businessLogo,
        businessAddress: current.businessAddress,
        businessEmail: current.businessEmail,
        businessPhone: current.businessPhone,
        businessWebsite: current.businessWebsite,
        businessTaxId: current.businessTaxId,
        businessRegistrationNumber: current.businessRegistrationNumber,
        businessInfo: current.businessInfo,
      }));
    } else {
      setQuotation(next);
    }

    setErrors({});
    setNotice("New quotation started.");
  };

  const duplicateQuotation = () => {
    setQuotation((current) => ({
      ...current,
      quotationNumber: generateQuotationNumber(),
      issueDate: today(),
      validUntil: futureDate(14),
      status: "Draft",
      items: current.items.map((item) => ({ ...item, id: makeId() })),
    }));
    setNotice("Quotation duplicated with a new number.");
  };

  const validateBeforeExport = () => {
    const nextErrors = validateQuotation(quotation);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setNotice("Fix the highlighted fields before downloading or printing.");
      return false;
    }

    return true;
  };

  const downloadPdf = async () => {
    if (!validateBeforeExport()) return;

    setIsGeneratingPdf(true);
    setNotice("");

    try {
      await downloadQuotationPdf(quotation);
      setNotice("Quotation PDF downloaded.");
    } catch {
      setNotice("PDF generation failed. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const printQuotation = () => {
    if (!validateBeforeExport()) return;
    window.print();
  };

  const convertToInvoice = () => {
    if (!validateBeforeExport()) return;
    if (localStorage.getItem(invoiceDraftKey) && !window.confirm("An invoice draft already exists. Continuing will replace it with this quotation.")) return;

    saveInvoiceDraft(quotationToInvoiceDraft(quotation));
    router.push("/invoice-generator");
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#589037] focus:ring-2 focus:ring-[#589037]/20 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-neutral-500";
  const labelClass = "block text-sm font-bold";

  return (
    <>
      <section className="quotation-no-print px-6 pb-4 pt-4 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#589037]">Quotation Generator</p>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <p className="mr-auto text-sm text-neutral-500 dark:text-neutral-300" aria-live="polite">
              {saveState}
            </p>
            <ActionButton onClick={saveDraft} icon={<Save size={17} />} label="Save draft" />
            <ActionButton onClick={duplicateQuotation} icon={<Copy size={17} />} label="Duplicate" />
            <ActionButton onClick={startNewQuotation} icon={<RotateCcw size={17} />} label="Start new" />
            <ActionButton onClick={printQuotation} icon={<Printer size={17} />} label="Print quotation" />
            <button
              onClick={downloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-3 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
            >
              <Download size={17} />
              {isGeneratingPdf ? "Generating..." : "Download PDF"}
            </button>
            <ActionButton onClick={convertToInvoice} icon={<Send size={17} />} label="Convert to invoice" />
          </div>
          {notice && (
            <div className="mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-black/10 bg-[#f7f7f4] p-4 text-sm dark:border-white/10 dark:bg-white/10" role="status">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#589037]" />
              <p>{notice}</p>
            </div>
          )}
        </div>
      </section>

      <AdSenseAd slot={ADSENSE_SLOTS.top} />

      <section className="px-3 pb-10 dark:bg-black">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2 lg:items-start">
          <div className="quotation-no-print grid gap-5 rounded-[2rem] bg-white p-4 shadow-sm dark:bg-black md:p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <Panel title="Business details">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField id="businessName" label="Business or company name" value={quotation.businessName} onChange={(value) => updateQuotation("businessName", value)} errors={errors} inputClass={inputClass} />
                <div>
                  <label className={labelClass} htmlFor="businessLogo">
                    Business logo
                  </label>
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-black/20 bg-[#f7f7f4] px-4 py-3 text-sm transition hover:border-[#589037] dark:border-white/20 dark:bg-black">
                    <Upload size={17} />
                    Upload logo
                    <input id="businessLogo" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="sr-only" />
                  </label>
                  {quotation.businessLogo && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={quotation.businessLogo} alt={`${quotation.businessName || "Business"} logo preview`} className="h-12 w-12 rounded-xl object-contain" />
                      <button type="button" onClick={() => updateQuotation("businessLogo", "")} className="inline-flex items-center gap-2 text-xs font-bold text-red-600">
                        <X size={14} />
                        Remove logo
                      </button>
                    </div>
                  )}
                  {logoError && <p className="mt-2 text-xs text-red-600">{logoError}</p>}
                </div>
                <TextareaField id="businessAddress" label="Business address" value={quotation.businessAddress} onChange={(value) => updateQuotation("businessAddress", value)} />
                <TextareaField id="businessInfo" label="Additional business information" value={quotation.businessInfo} onChange={(value) => updateQuotation("businessInfo", value)} />
                <TextField id="businessEmail" label="Business email" value={quotation.businessEmail} onChange={(value) => updateQuotation("businessEmail", value)} errors={errors} inputClass={inputClass} type="email" />
                <TextField id="businessPhone" label="Business phone number" value={quotation.businessPhone} onChange={(value) => updateQuotation("businessPhone", value)} inputClass={inputClass} />
                <TextField id="businessWebsite" label="Business website" value={quotation.businessWebsite} onChange={(value) => updateQuotation("businessWebsite", value)} errors={errors} inputClass={inputClass} placeholder="https://example.com" />
                <TextField id="businessTaxId" label="Tax identification number" value={quotation.businessTaxId} onChange={(value) => updateQuotation("businessTaxId", value)} inputClass={inputClass} />
                <TextField id="businessRegistrationNumber" label="Business registration number" value={quotation.businessRegistrationNumber} onChange={(value) => updateQuotation("businessRegistrationNumber", value)} inputClass={inputClass} />
              </div>
            </Panel>

            <Panel title="Customer details">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField id="customerName" label="Customer or company name" value={quotation.customerName} onChange={(value) => updateQuotation("customerName", value)} errors={errors} inputClass={inputClass} />
                <TextField id="contactPerson" label="Contact person" value={quotation.contactPerson} onChange={(value) => updateQuotation("contactPerson", value)} inputClass={inputClass} />
                <TextField id="customerEmail" label="Customer email" value={quotation.customerEmail} onChange={(value) => updateQuotation("customerEmail", value)} errors={errors} inputClass={inputClass} type="email" />
                <TextField id="customerPhone" label="Customer phone number" value={quotation.customerPhone} onChange={(value) => updateQuotation("customerPhone", value)} inputClass={inputClass} />
                <TextField id="customerTaxId" label="Customer tax identification number" value={quotation.customerTaxId} onChange={(value) => updateQuotation("customerTaxId", value)} inputClass={inputClass} />
                <div className="md:col-span-2">
                  <TextareaField id="customerAddress" label="Customer billing address" value={quotation.customerAddress} onChange={(value) => updateQuotation("customerAddress", value)} />
                </div>
              </div>
            </Panel>

            <Panel title="Quotation details">
              <div className="grid gap-4 md:grid-cols-3">
                <TextField id="quotationNumber" label="Quotation number" value={quotation.quotationNumber} onChange={(value) => updateQuotation("quotationNumber", value)} errors={errors} inputClass={inputClass} />
                <DateField id="issueDate" label="Issue date" value={quotation.issueDate} onChange={(value) => updateQuotation("issueDate", value)} errors={errors} inputClass={inputClass} />
                <DateField id="validUntil" label="Valid-until date" value={quotation.validUntil} onChange={(value) => updateQuotation("validUntil", value)} errors={errors} inputClass={inputClass} />
                <TextField id="reference" label="Reference number" value={quotation.reference} onChange={(value) => updateQuotation("reference", value)} inputClass={inputClass} />
                <TextField id="salesRepresentative" label="Sales representative" value={quotation.salesRepresentative} onChange={(value) => updateQuotation("salesRepresentative", value)} inputClass={inputClass} />
                <TextField id="projectName" label="Project name" value={quotation.projectName} onChange={(value) => updateQuotation("projectName", value)} inputClass={inputClass} />
                <SelectField id="status" label="Quotation status" value={quotation.status} onChange={(value) => updateQuotation("status", value as QuotationStatus)} inputClass={inputClass} options={["Draft", "Sent", "Accepted", "Declined", "Expired"]} />
                <SelectField id="currency" label="Currency" value={quotation.currency} onChange={(value) => updateQuotation("currency", value as CurrencyCode)} inputClass={inputClass} options={currencies.map((currency) => `${currency.code} - ${currency.label}`)} optionValues={currencies.map((currency) => currency.code)} />
                <SelectField id="template" label="Template" value={quotation.template} onChange={(value) => updateQuotation("template", value as QuotationTemplate)} inputClass={inputClass} options={["modern", "minimal"]} />
              </div>
            </Panel>

            <Panel title="Products and services">
              {errors.items && <p className="mb-4 text-sm text-red-600">{errors.items}</p>}
              <div className="grid gap-4">
                {quotation.items.map((item, index) => {
                  const line = totals.lines.find((entry) => entry.id === item.id);

                  return (
                    <div key={item.id} className="rounded-[1.5rem] border border-black/10 bg-[#f7f7f4] p-4 dark:border-white/10 dark:bg-black">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-black">Item {index + 1}</h3>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => duplicateItem(item.id)} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-bold dark:border-white/10">
                            <Copy size={14} />
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={quotation.items.length === 1}
                            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <TextField id={`item-name-${item.id}`} label="Item or service name" value={item.name} onChange={(value) => updateItem(item.id, "name", value)} inputClass={inputClass} />
                        <NumberField id={`quantity-${item.id}`} label="Quantity" value={item.quantity} onChange={(value) => updateItem(item.id, "quantity", value)} errors={errors} inputClass={inputClass} min="0.01" step="0.01" errorId={`items.${item.id}.quantity`} />
                        <div>
                          <label className={labelClass} htmlFor={`unit-${item.id}`}>
                            Unit
                          </label>
                          <input id={`unit-${item.id}`} list="quotation-units" value={item.unit} onChange={(event) => updateItem(item.id, "unit", event.target.value)} className={inputClass} />
                        </div>
                        <NumberField id={`unitPrice-${item.id}`} label="Unit price" value={item.unitPrice} onChange={(value) => updateItem(item.id, "unitPrice", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" errorId={`items.${item.id}.unitPrice`} />
                        <SelectField id={`lineDiscountType-${item.id}`} label="Line discount type" value={item.discountType} onChange={(value) => updateItem(item.id, "discountType", value as DiscountType)} inputClass={inputClass} options={["percentage", "fixed"]} />
                        <NumberField id={`lineDiscount-${item.id}`} label="Line discount" value={item.discountValue} onChange={(value) => updateItem(item.id, "discountValue", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" errorId={`items.${item.id}.discountValue`} />
                        <NumberField id={`tax-${item.id}`} label="Tax %" value={item.taxRate} onChange={(value) => updateItem(item.id, "taxRate", value)} errors={errors} inputClass={inputClass} min="0" max="100" step="0.01" errorId={`items.${item.id}.taxRate`} />
                        <div className="rounded-2xl bg-white p-4 text-sm dark:bg-white/10">
                          <p className="text-neutral-500 dark:text-neutral-300">Line total</p>
                          <p className="mt-1 text-lg font-black">{formatMoney(line?.total || 0, quotation.currency)}</p>
                        </div>
                        <div className="md:col-span-3">
                          <TextareaField id={`description-${item.id}`} label="Description" value={item.description} onChange={(value) => updateItem(item.id, "description", value)} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <datalist id="quotation-units">
                {units.map((unit) => (
                  <option key={unit} value={unit} />
                ))}
              </datalist>
              <button type="button" onClick={addItem} className="mt-4 inline-flex items-center gap-3 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] dark:bg-white dark:text-black">
                <Plus size={17} />
                Add item
              </button>
            </Panel>

            <Panel title="Totals, deposit and design">
              <div className="grid gap-4 md:grid-cols-3">
                <SelectField id="discountType" label="Overall discount type" value={quotation.discountType} onChange={(value) => updateQuotation("discountType", value as DiscountType)} inputClass={inputClass} options={["percentage", "fixed"]} />
                <NumberField id="discountValue" label="Overall discount" value={quotation.discountValue} onChange={(value) => updateQuotation("discountValue", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" />
                <NumberField id="shipping" label="Shipping or delivery charge" value={quotation.shipping} onChange={(value) => updateQuotation("shipping", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" />
                <NumberField id="additionalCharge" label="Additional charge" value={quotation.additionalCharge} onChange={(value) => updateQuotation("additionalCharge", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" />
                <SelectField id="depositType" label="Deposit type" value={quotation.depositType} onChange={(value) => updateQuotation("depositType", value as DepositType)} inputClass={inputClass} options={["percentage", "fixed"]} />
                <NumberField id="depositValue" label="Deposit requirement" value={quotation.depositValue} onChange={(value) => updateQuotation("depositValue", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" />
                <div className="md:col-span-3">
                  <label className={labelClass}>Accent colour</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => updateQuotation("accentColor", color.value)}
                        className={`h-10 w-10 rounded-full border-2 ${quotation.accentColor === color.value ? "border-black dark:border-white" : "border-transparent"}`}
                        style={{ backgroundColor: color.value }}
                        aria-label={`Use ${color.name} accent colour`}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      id="customQuotationAccentColor"
                      type="color"
                      value={colorPickerValue}
                      onChange={(event) => updateQuotation("accentColor", event.target.value)}
                      className="h-12 w-16 cursor-pointer rounded-2xl border border-black/10 bg-[#f7f7f4] p-1 dark:border-white/10 dark:bg-black"
                      aria-label="Choose custom accent colour"
                    />
                    <input
                      value={quotation.accentColor}
                      onChange={(event) => updateQuotation("accentColor", event.target.value)}
                      className={inputClass}
                      aria-label="Custom accent colour hex value"
                      placeholder="#589037"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 rounded-[1.5rem] bg-[#f7f7f4] p-5 text-sm dark:bg-white/10">
                <SummaryRow label="Subtotal before discounts" value={formatMoney(totals.subtotalBeforeDiscount, quotation.currency)} />
                <SummaryRow label="Line discounts" value={`-${formatMoney(totals.lineDiscount, quotation.currency)}`} />
                <SummaryRow label="Tax" value={formatMoney(totals.tax, quotation.currency)} />
                <SummaryRow label="Overall discount" value={`-${formatMoney(totals.overallDiscount, quotation.currency)}`} />
                <SummaryRow label="Grand total" value={formatMoney(totals.grandTotal, quotation.currency)} strong />
                <SummaryRow label="Deposit required" value={formatMoney(totals.depositRequired, quotation.currency)} strong />
                <SummaryRow label="Balance after deposit" value={formatMoney(totals.balanceAfterDeposit, quotation.currency)} />
              </div>
            </Panel>

            <Panel title="Notes, terms and payment">
              <div className="grid gap-4 md:grid-cols-2">
                <TextareaField id="introductoryMessage" label="Introductory message" value={quotation.introductoryMessage} onChange={(value) => updateQuotation("introductoryMessage", value)} />
                <TextareaField id="notes" label="Notes" value={quotation.notes} onChange={(value) => updateQuotation("notes", value)} />
                <TextareaField id="terms" label="Terms and conditions" value={quotation.terms} onChange={(value) => updateQuotation("terms", value)} />
                <TextareaField id="deliveryTimeline" label="Delivery timeline" value={quotation.deliveryTimeline} onChange={(value) => updateQuotation("deliveryTimeline", value)} />
                <TextareaField id="estimatedCompletionTime" label="Estimated completion time" value={quotation.estimatedCompletionTime} onChange={(value) => updateQuotation("estimatedCompletionTime", value)} />
                <TextareaField id="warrantyInformation" label="Warranty information" value={quotation.warrantyInformation} onChange={(value) => updateQuotation("warrantyInformation", value)} />
                <TextareaField id="paymentTerms" label="Payment terms" value={quotation.paymentTerms} onChange={(value) => updateQuotation("paymentTerms", value)} />
                <TextareaField id="bankDetails" label="Bank details" value={quotation.bankDetails} onChange={(value) => updateQuotation("bankDetails", value)} />
                <TextField id="paymentLink" label="Payment link" value={quotation.paymentLink} onChange={(value) => updateQuotation("paymentLink", value)} errors={errors} inputClass={inputClass} placeholder="https://..." />
                <div className="rounded-[1.25rem] bg-[#f7f7f4] p-4 dark:bg-white/10">
                  <label className="flex items-start gap-3 text-sm font-bold">
                    <input type="checkbox" checked={quotation.showAcceptance} onChange={(event) => updateQuotation("showAcceptance", event.target.checked)} className="mt-1" />
                    Show customer acceptance section
                  </label>
                  <p className="mt-3 text-xs leading-5 text-neutral-500 dark:text-neutral-300">Adds printable name, signature and date lines to the quotation.</p>
                </div>
                <TextareaField id="acceptanceInstructions" label="Customer acceptance instructions" value={quotation.acceptanceInstructions} onChange={(value) => updateQuotation("acceptanceInstructions", value)} />
              </div>
            </Panel>

            <div className="rounded-[1.5rem] bg-[#f7f7f4] p-5 text-sm leading-7 text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
              Privacy note: quotation data and uploaded logos stay in this browser through localStorage. Anulen does not receive this information unless
              you choose to send it separately.
            </div>
          </div>

          <div className="quotation-preview-scroll lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <div className="quotation-no-print mb-4 flex items-center gap-3 rounded-[1.5rem] bg-black p-5 text-white dark:bg-white dark:text-black">
              <FileText size={20} />
              <div>
                <h2 className="text-lg font-black">Live preview</h2>
                <p className="text-sm opacity-70">This is what prints and exports to PDF.</p>
              </div>
            </div>
            <QuotationPreview quotation={quotation} />
          </div>
        </div>
      </section>

      <AdSenseAd slot={ADSENSE_SLOTS.middle} />
    </>
  );
}

function ActionButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-3 rounded-full border border-black px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
      {icon}
      {label}
    </button>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-black">
      <h2 className="mb-5 text-2xl font-black tracking-[-0.04em]">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  inputClass,
  errors = {},
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  errors?: QuotationValidationErrors;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} placeholder={placeholder} />
      <FieldError id={id} errors={errors} />
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  inputClass,
  errors = {},
  min,
  max,
  step,
  errorId,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  inputClass: string;
  errors?: QuotationValidationErrors;
  min?: string;
  max?: string;
  step?: string;
  errorId?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <input id={id} type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(numberValue(event.target.value))} className={inputClass} />
      <FieldError id={errorId || id} errors={errors} />
    </div>
  );
}

function DateField({ id, label, value, onChange, inputClass, errors = {} }: { id: string; label: string; value: string; onChange: (value: string) => void; inputClass: string; errors?: QuotationValidationErrors }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <input id={id} type="date" value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />
      <FieldError id={id} errors={errors} />
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  inputClass,
  options,
  optionValues,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  options: string[];
  optionValues?: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map((option, index) => (
          <option key={optionValues?.[index] || option} value={optionValues?.[index] || option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#589037] focus:ring-2 focus:ring-[#589037]/20 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-neutral-500"
        placeholder="Optional"
      />
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "text-base font-black" : ""}`}>
      <span className="text-neutral-500 dark:text-neutral-300">{label}</span>
      <span>{value}</span>
    </div>
  );
}
