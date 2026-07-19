"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Copy, Download, FileText, Plus, Printer, RotateCcw, Save, Trash2, Upload, X } from "lucide-react";
import ReceiptPreview from "@/components/receipt/ReceiptPreview";
import { calculateReceiptTotals } from "@/lib/receipt/calculations";
import { currencies, formatMoney } from "@/lib/invoice/currency";
import { downloadReceiptPdf } from "@/lib/receipt/pdf";
import { generateReceiptNumber } from "@/lib/receipt/receiptNumber";
import { clearReceiptDraft, loadReceiptDraft, saveReceiptDraft } from "@/lib/receipt/storage";
import { validateReceipt } from "@/lib/receipt/validation";
import type { ReceiptData, ReceiptItem, ReceiptMethod, ReceiptStatus, ReceiptTemplate, ReceiptValidationErrors } from "@/lib/receipt/types";
import type { CurrencyCode, DiscountType } from "@/lib/invoice/types";
import AdSenseAd from "@/components/ads/AdSenseAd";
import { ADSENSE_SLOTS } from "@/lib/adsense";

const maxLogoSize = 2_000_000;
const units = ["Item", "Piece", "Service", "Hour", "Day", "Package", "Kilogram", "Month", "Custom"];
const accentColors = [
  { name: "Anulen green", value: "#589037" },
  { name: "Blue", value: "#2563eb" },
  { name: "Slate", value: "#475569" },
  { name: "Black", value: "#111111" },
  { name: "Gold", value: "#b7791f" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function makeItem(): ReceiptItem {
  return {
    id: makeId(),
    name: "",
    description: "",
    quantity: 1,
    unit: "Item",
    unitPrice: 0,
    discountType: "percentage",
    discountValue: 0,
    taxRate: 0,
  };
}

function makeEmptyReceipt(): ReceiptData {
  return {
    simpleMode: false,
    anonymousCustomer: false,
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
    receiptNumber: generateReceiptNumber(),
    paymentDate: today(),
    paymentTime: nowTime(),
    currency: "NGN",
    status: "Paid",
    relatedInvoiceNumber: "",
    relatedQuotationNumber: "",
    reference: "",
    transactionId: "",
    salesRepresentative: "",
    branchLocation: "",
    paymentMethod: "Cash",
    bankName: "",
    accountName: "",
    transactionReference: "",
    cardLastFour: "",
    terminalReference: "",
    cardType: "",
    chequeNumber: "",
    chequeDate: "",
    paymentProvider: "",
    customPaymentMethod: "",
    paymentDescription: "",
    discountType: "percentage",
    discountValue: 0,
    shipping: 0,
    additionalCharge: 0,
    amountReceived: 0,
    refundedAmount: 0,
    notes: "",
    thankYouMessage: "Thank you for your payment.",
    acknowledgement: "This receipt confirms that the payment shown above has been received.",
    terms: "",
    refundPolicy: "",
    internalNote: "",
    showInternalNote: false,
    showSignature: true,
    issuedBy: "",
    showCustomerSignature: false,
    showBusinessStamp: false,
    template: "modern",
    accentColor: "#589037",
    items: [makeItem()],
  };
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasEnteredData(receipt: ReceiptData) {
  const empty = makeEmptyReceipt();
  return JSON.stringify({ ...receipt, receiptNumber: "", paymentDate: "", paymentTime: "", items: [] }) !== JSON.stringify({ ...empty, receiptNumber: "", paymentDate: "", paymentTime: "", items: [] });
}

function FieldError({ id, errors }: { id: string; errors: ReceiptValidationErrors }) {
  if (!errors[id]) return null;

  return <p className="mt-2 text-xs leading-5 text-red-600">{errors[id]}</p>;
}

export default function ReceiptGenerator() {
  const [receipt, setReceipt] = useState<ReceiptData>(() => makeEmptyReceipt());
  const [errors, setErrors] = useState<ReceiptValidationErrors>({});
  const [notice, setNotice] = useState("");
  const [logoError, setLogoError] = useState("");
  const [saveState, setSaveState] = useState("Draft not saved yet");
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const totals = useMemo(() => calculateReceiptTotals(receipt), [receipt]);
  const colorPickerValue = /^#[0-9a-fA-F]{6}$/.test(receipt.accentColor) ? receipt.accentColor : "#589037";

  useEffect(() => {
    const savedDraft = loadReceiptDraft();
    if (savedDraft) {
      setReceipt({ ...makeEmptyReceipt(), ...savedDraft, items: savedDraft.items?.length ? savedDraft.items : [makeItem()] });
      setNotice("Saved receipt draft restored.");
      setSaveState("Draft restored");
    }
    setHasLoadedDraft(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedDraft) return;

    setSaveState("Saving...");
    const timer = window.setTimeout(() => {
      saveReceiptDraft(receipt);
      setSaveState("Draft saved");
    }, 800);

    return () => window.clearTimeout(timer);
  }, [hasLoadedDraft, receipt]);

  const updateReceipt = <K extends keyof ReceiptData>(key: K, value: ReceiptData[K]) => {
    setReceipt((current) => ({ ...current, [key]: value }));
  };

  const updateItem = <K extends keyof ReceiptItem>(id: string, key: K, value: ReceiptItem[K]) => {
    setReceipt((current) => ({ ...current, items: current.items.map((item) => (item.id === id ? { ...item, [key]: value } : item)) }));
  };

  const addItem = () => setReceipt((current) => ({ ...current, items: [...current.items, makeItem()] }));

  const duplicateItem = (id: string) => {
    setReceipt((current) => {
      const source = current.items.find((item) => item.id === id);
      return source ? { ...current, items: [...current.items, { ...source, id: makeId() }] } : current;
    });
  };

  const removeItem = (id: string) => {
    setReceipt((current) => (current.items.length === 1 ? current : { ...current, items: current.items.filter((item) => item.id !== id) }));
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
      if (typeof reader.result === "string") updateReceipt("businessLogo", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveDraft = () => {
    saveReceiptDraft(receipt);
    setSaveState("Draft saved");
    setNotice("Receipt draft saved on this browser.");
  };

  const clearReceipt = () => {
    if (hasEnteredData(receipt) && !window.confirm("Clear this receipt and remove the saved draft?")) return;
    clearReceiptDraft();
    setReceipt(makeEmptyReceipt());
    setErrors({});
    setLogoError("");
    setNotice("Receipt cleared.");
    setSaveState("Draft not saved yet");
  };

  const startNewReceipt = () => {
    const keepBusiness = window.confirm("Start a new receipt and keep your business details?");
    const next = makeEmptyReceipt();

    if (keepBusiness) {
      setReceipt((current) => ({
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
      setReceipt(next);
    }
    setErrors({});
    setNotice("New receipt started.");
  };

  const duplicateReceipt = () => {
    setReceipt((current) => ({
      ...current,
      receiptNumber: generateReceiptNumber(),
      paymentDate: today(),
      paymentTime: nowTime(),
      status: "Paid",
      reference: "",
      transactionId: "",
      transactionReference: "",
      terminalReference: "",
      chequeNumber: "",
      items: current.items.map((item) => ({ ...item, id: makeId() })),
    }));
    setNotice("Receipt duplicated with a new number.");
  };

  const toggleSimpleMode = (enabled: boolean) => {
    if (enabled === receipt.simpleMode) return;
    if (!window.confirm("Switch receipt mode? Your existing details will stay, but the preview and calculations will use the selected mode.")) return;
    updateReceipt("simpleMode", enabled);
  };

  const validateBeforeExport = () => {
    const nextErrors = validateReceipt(receipt);
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
      await downloadReceiptPdf(receipt);
      setNotice("Receipt PDF downloaded.");
    } catch {
      setNotice("PDF generation failed. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const printReceipt = () => {
    if (!validateBeforeExport()) return;
    window.print();
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#589037] focus:ring-2 focus:ring-[#589037]/20 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-neutral-500";
  const labelClass = "block text-sm font-bold";

  return (
    <>
      <section className="receipt-no-print px-6 pb-4 pt-4 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#589037]">Receipt Generator</p>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="mr-auto flex flex-wrap gap-4 text-sm">
              <p className="text-neutral-500 dark:text-neutral-300" aria-live="polite">
                {saveState}
              </p>
              <Link href="/invoice-generator" className="font-bold text-[#589037]">
                Need an invoice?
              </Link>
              <Link href="/quotation-generator" className="font-bold text-[#589037]">
                Need a quotation?
              </Link>
            </div>
            <ActionButton onClick={saveDraft} icon={<Save size={17} />} label="Save draft" />
            <ActionButton onClick={duplicateReceipt} icon={<Copy size={17} />} label="Duplicate" />
            <ActionButton onClick={startNewReceipt} icon={<RotateCcw size={17} />} label="Start new" />
            <ActionButton onClick={clearReceipt} icon={<Trash2 size={17} />} label="Clear receipt" />
            <ActionButton onClick={printReceipt} icon={<Printer size={17} />} label="Print receipt" />
            <button onClick={downloadPdf} disabled={isGeneratingPdf} className="inline-flex items-center gap-3 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black">
              <Download size={17} />
              {isGeneratingPdf ? "Generating..." : "Download PDF"}
            </button>
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
          <div className="receipt-no-print grid gap-5 rounded-[2rem] bg-white p-4 shadow-sm dark:bg-black md:p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <Panel title="Receipt mode">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-start gap-3 rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                  <input type="checkbox" checked={receipt.simpleMode} onChange={(event) => toggleSimpleMode(event.target.checked)} className="mt-1" />
                  Simple receipt mode
                </label>
                <label className="flex items-start gap-3 rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                  <input type="checkbox" checked={receipt.anonymousCustomer} onChange={(event) => updateReceipt("anonymousCustomer", event.target.checked)} className="mt-1" />
                  Anonymous or walk-in customer
                </label>
              </div>
            </Panel>

            <Panel title="Business details">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField id="businessName" label="Business or company name" value={receipt.businessName} onChange={(value) => updateReceipt("businessName", value)} errors={errors} inputClass={inputClass} />
                <div>
                  <label className={labelClass} htmlFor="businessLogo">
                    Business logo
                  </label>
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-black/20 bg-[#f7f7f4] px-4 py-3 text-sm transition hover:border-[#589037] dark:border-white/20 dark:bg-black">
                    <Upload size={17} />
                    Upload logo
                    <input id="businessLogo" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="sr-only" />
                  </label>
                  {receipt.businessLogo && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={receipt.businessLogo} alt={`${receipt.businessName || "Business"} logo preview`} className="h-12 w-12 rounded-xl object-contain" />
                      <button type="button" onClick={() => updateReceipt("businessLogo", "")} className="inline-flex items-center gap-2 text-xs font-bold text-red-600">
                        <X size={14} />
                        Remove logo
                      </button>
                    </div>
                  )}
                  {logoError && <p className="mt-2 text-xs text-red-600">{logoError}</p>}
                </div>
                <TextareaField id="businessAddress" label="Business address" value={receipt.businessAddress} onChange={(value) => updateReceipt("businessAddress", value)} />
                <TextareaField id="businessInfo" label="Additional business information" value={receipt.businessInfo} onChange={(value) => updateReceipt("businessInfo", value)} />
                <TextField id="businessEmail" label="Business email" value={receipt.businessEmail} onChange={(value) => updateReceipt("businessEmail", value)} errors={errors} inputClass={inputClass} type="email" />
                <TextField id="businessPhone" label="Business phone number" value={receipt.businessPhone} onChange={(value) => updateReceipt("businessPhone", value)} inputClass={inputClass} />
                <TextField id="businessWebsite" label="Business website" value={receipt.businessWebsite} onChange={(value) => updateReceipt("businessWebsite", value)} errors={errors} inputClass={inputClass} placeholder="https://example.com" />
                <TextField id="businessTaxId" label="Tax identification number" value={receipt.businessTaxId} onChange={(value) => updateReceipt("businessTaxId", value)} inputClass={inputClass} />
                <TextField id="businessRegistrationNumber" label="Business registration number" value={receipt.businessRegistrationNumber} onChange={(value) => updateReceipt("businessRegistrationNumber", value)} inputClass={inputClass} />
              </div>
            </Panel>

            <Panel title="Customer details">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField id="customerName" label="Customer or company name" value={receipt.customerName} onChange={(value) => updateReceipt("customerName", value)} errors={errors} inputClass={inputClass} />
                <TextField id="contactPerson" label="Contact person" value={receipt.contactPerson} onChange={(value) => updateReceipt("contactPerson", value)} inputClass={inputClass} />
                <TextField id="customerEmail" label="Customer email" value={receipt.customerEmail} onChange={(value) => updateReceipt("customerEmail", value)} errors={errors} inputClass={inputClass} type="email" />
                <TextField id="customerPhone" label="Customer phone number" value={receipt.customerPhone} onChange={(value) => updateReceipt("customerPhone", value)} inputClass={inputClass} />
                <TextField id="customerTaxId" label="Customer tax identification number" value={receipt.customerTaxId} onChange={(value) => updateReceipt("customerTaxId", value)} inputClass={inputClass} />
                <div className="md:col-span-2">
                  <TextareaField id="customerAddress" label="Customer address" value={receipt.customerAddress} onChange={(value) => updateReceipt("customerAddress", value)} />
                </div>
              </div>
            </Panel>

            <Panel title="Receipt details">
              <div className="grid gap-4 md:grid-cols-3">
                <TextField id="receiptNumber" label="Receipt number" value={receipt.receiptNumber} onChange={(value) => updateReceipt("receiptNumber", value)} errors={errors} inputClass={inputClass} />
                <DateField id="paymentDate" label="Payment date" value={receipt.paymentDate} onChange={(value) => updateReceipt("paymentDate", value)} errors={errors} inputClass={inputClass} />
                <TextField id="paymentTime" label="Payment time" value={receipt.paymentTime} onChange={(value) => updateReceipt("paymentTime", value)} inputClass={inputClass} type="time" />
                <SelectField id="currency" label="Currency" value={receipt.currency} onChange={(value) => updateReceipt("currency", value as CurrencyCode)} inputClass={inputClass} options={currencies.map((currency) => `${currency.code} - ${currency.label}`)} optionValues={currencies.map((currency) => currency.code)} />
                <SelectField id="status" label="Payment status" value={receipt.status} onChange={(value) => updateReceipt("status", value as ReceiptStatus)} inputClass={inputClass} options={["Paid", "Partially Paid", "Refunded", "Voided"]} />
                <SelectField id="template" label="Receipt format" value={receipt.template} onChange={(value) => updateReceipt("template", value as ReceiptTemplate)} inputClass={inputClass} options={["modern", "minimal", "compact"]} />
                <TextField id="relatedInvoiceNumber" label="Related invoice number" value={receipt.relatedInvoiceNumber} onChange={(value) => updateReceipt("relatedInvoiceNumber", value)} inputClass={inputClass} />
                <TextField id="relatedQuotationNumber" label="Related quotation number" value={receipt.relatedQuotationNumber} onChange={(value) => updateReceipt("relatedQuotationNumber", value)} inputClass={inputClass} />
                <TextField id="reference" label="Reference number" value={receipt.reference} onChange={(value) => updateReceipt("reference", value)} inputClass={inputClass} />
                <TextField id="transactionId" label="Transaction ID" value={receipt.transactionId} onChange={(value) => updateReceipt("transactionId", value)} inputClass={inputClass} />
                <TextField id="salesRepresentative" label="Sales representative or cashier" value={receipt.salesRepresentative} onChange={(value) => updateReceipt("salesRepresentative", value)} inputClass={inputClass} />
                <TextField id="branchLocation" label="Branch or location" value={receipt.branchLocation} onChange={(value) => updateReceipt("branchLocation", value)} inputClass={inputClass} />
              </div>
            </Panel>

            <Panel title="Payment method">
              <div className="grid gap-4 md:grid-cols-3">
                <SelectField id="paymentMethod" label="Payment method" value={receipt.paymentMethod} onChange={(value) => updateReceipt("paymentMethod", value as ReceiptMethod)} inputClass={inputClass} options={["Cash", "Bank Transfer", "Debit or Credit Card", "POS", "Mobile Money", "Cheque", "Online Payment", "Cryptocurrency", "Other"]} />
                {["Bank Transfer", "Cheque"].includes(receipt.paymentMethod) && <TextField id="bankName" label="Bank name" value={receipt.bankName} onChange={(value) => updateReceipt("bankName", value)} inputClass={inputClass} />}
                {receipt.paymentMethod === "Bank Transfer" && <TextField id="accountName" label="Account name" value={receipt.accountName} onChange={(value) => updateReceipt("accountName", value)} inputClass={inputClass} />}
                {["Bank Transfer", "Online Payment", "Mobile Money", "Cryptocurrency"].includes(receipt.paymentMethod) && <TextField id="transactionReference" label="Transaction reference" value={receipt.transactionReference} onChange={(value) => updateReceipt("transactionReference", value)} inputClass={inputClass} />}
                {["Debit or Credit Card", "POS"].includes(receipt.paymentMethod) && <TextField id="cardLastFour" label="Last four digits" value={receipt.cardLastFour} onChange={(value) => updateReceipt("cardLastFour", value.slice(0, 4))} inputClass={inputClass} />}
                {["Debit or Credit Card", "POS"].includes(receipt.paymentMethod) && <TextField id="terminalReference" label="Terminal reference" value={receipt.terminalReference} onChange={(value) => updateReceipt("terminalReference", value)} inputClass={inputClass} />}
                {["Debit or Credit Card", "POS"].includes(receipt.paymentMethod) && <TextField id="cardType" label="Card type" value={receipt.cardType} onChange={(value) => updateReceipt("cardType", value)} inputClass={inputClass} placeholder="Visa, Mastercard..." />}
                {receipt.paymentMethod === "Cheque" && <TextField id="chequeNumber" label="Cheque number" value={receipt.chequeNumber} onChange={(value) => updateReceipt("chequeNumber", value)} inputClass={inputClass} />}
                {receipt.paymentMethod === "Cheque" && <DateField id="chequeDate" label="Cheque date" value={receipt.chequeDate} onChange={(value) => updateReceipt("chequeDate", value)} errors={errors} inputClass={inputClass} />}
                {receipt.paymentMethod === "Online Payment" && <TextField id="paymentProvider" label="Payment provider" value={receipt.paymentProvider} onChange={(value) => updateReceipt("paymentProvider", value)} inputClass={inputClass} />}
                {receipt.paymentMethod === "Other" && <TextField id="customPaymentMethod" label="Custom payment method" value={receipt.customPaymentMethod} onChange={(value) => updateReceipt("customPaymentMethod", value)} inputClass={inputClass} />}
              </div>
              <p className="mt-4 text-xs leading-5 text-neutral-500 dark:text-neutral-300">Do not enter full card numbers, CVV, PINs, passwords or sensitive payment credentials.</p>
            </Panel>

            {receipt.simpleMode ? (
              <Panel title="Payment description">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextareaField id="paymentDescription" label="Description of payment" value={receipt.paymentDescription} onChange={(value) => updateReceipt("paymentDescription", value)} errors={errors} />
                  <NumberField id="amountReceived" label="Amount received" value={receipt.amountReceived} onChange={(value) => updateReceipt("amountReceived", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" />
                </div>
              </Panel>
            ) : (
              <Panel title="Paid items and services">
                {errors.items && <p className="mb-4 text-sm text-red-600">{errors.items}</p>}
                <div className="grid gap-4">
                  {receipt.items.map((item, index) => {
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
                            <button type="button" onClick={() => removeItem(item.id)} disabled={receipt.items.length === 1} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10">
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
                            <input id={`unit-${item.id}`} list="receipt-units" value={item.unit} onChange={(event) => updateItem(item.id, "unit", event.target.value)} className={inputClass} />
                          </div>
                          <NumberField id={`unitPrice-${item.id}`} label="Unit price" value={item.unitPrice} onChange={(value) => updateItem(item.id, "unitPrice", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" errorId={`items.${item.id}.unitPrice`} />
                          <SelectField id={`lineDiscountType-${item.id}`} label="Line discount type" value={item.discountType} onChange={(value) => updateItem(item.id, "discountType", value as DiscountType)} inputClass={inputClass} options={["percentage", "fixed"]} />
                          <NumberField id={`lineDiscount-${item.id}`} label="Line discount" value={item.discountValue} onChange={(value) => updateItem(item.id, "discountValue", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" errorId={`items.${item.id}.discountValue`} />
                          <NumberField id={`tax-${item.id}`} label="Tax %" value={item.taxRate} onChange={(value) => updateItem(item.id, "taxRate", value)} errors={errors} inputClass={inputClass} min="0" max="100" step="0.01" errorId={`items.${item.id}.taxRate`} />
                          <div className="rounded-2xl bg-white p-4 text-sm dark:bg-white/10">
                            <p className="text-neutral-500 dark:text-neutral-300">Line total</p>
                            <p className="mt-1 text-lg font-black">{formatMoney(line?.total || 0, receipt.currency)}</p>
                          </div>
                          <div className="md:col-span-3">
                            <TextareaField id={`description-${item.id}`} label="Description" value={item.description} onChange={(value) => updateItem(item.id, "description", value)} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <datalist id="receipt-units">
                  {units.map((unit) => (
                    <option key={unit} value={unit} />
                  ))}
                </datalist>
                <button type="button" onClick={addItem} className="mt-4 inline-flex items-center gap-3 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] dark:bg-white dark:text-black">
                  <Plus size={17} />
                  Add item
                </button>
              </Panel>
            )}

            <Panel title="Totals and design">
              <div className="grid gap-4 md:grid-cols-3">
                {!receipt.simpleMode && (
                  <>
                    <SelectField id="discountType" label="Overall discount type" value={receipt.discountType} onChange={(value) => updateReceipt("discountType", value as DiscountType)} inputClass={inputClass} options={["percentage", "fixed"]} />
                    <NumberField id="discountValue" label="Overall discount" value={receipt.discountValue} onChange={(value) => updateReceipt("discountValue", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" />
                    <NumberField id="shipping" label="Shipping or delivery charge" value={receipt.shipping} onChange={(value) => updateReceipt("shipping", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" />
                    <NumberField id="additionalCharge" label="Additional charge" value={receipt.additionalCharge} onChange={(value) => updateReceipt("additionalCharge", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" />
                  </>
                )}
                {!receipt.simpleMode && <NumberField id="amountReceived" label="Amount received" value={receipt.amountReceived} onChange={(value) => updateReceipt("amountReceived", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" />}
                {receipt.status === "Refunded" && <NumberField id="refundedAmount" label="Refunded amount" value={receipt.refundedAmount} onChange={(value) => updateReceipt("refundedAmount", value)} errors={errors} inputClass={inputClass} min="0" step="0.01" />}
                <div className="md:col-span-3">
                  <label className={labelClass}>Accent colour</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {accentColors.map((color) => (
                      <button key={color.value} type="button" onClick={() => updateReceipt("accentColor", color.value)} className={`h-10 w-10 rounded-full border-2 ${receipt.accentColor === color.value ? "border-black dark:border-white" : "border-transparent"}`} style={{ backgroundColor: color.value }} aria-label={`Use ${color.name} accent colour`} />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <input id="customReceiptAccentColor" type="color" value={colorPickerValue} onChange={(event) => updateReceipt("accentColor", event.target.value)} className="h-12 w-16 cursor-pointer rounded-2xl border border-black/10 bg-[#f7f7f4] p-1 dark:border-white/10 dark:bg-black" aria-label="Choose custom accent colour" />
                    <input value={receipt.accentColor} onChange={(event) => updateReceipt("accentColor", event.target.value)} className={inputClass} aria-label="Custom accent colour hex value" placeholder="#589037" />
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 rounded-[1.5rem] bg-[#f7f7f4] p-5 text-sm dark:bg-white/10">
                <SummaryRow label="Grand total" value={formatMoney(totals.grandTotal, receipt.currency)} strong />
                <SummaryRow label="Amount received" value={formatMoney(totals.amountReceived, receipt.currency)} strong />
                <SummaryRow label="Balance due" value={formatMoney(totals.balanceDue, receipt.currency)} />
                <SummaryRow label="Change due" value={formatMoney(totals.changeDue, receipt.currency)} />
              </div>
            </Panel>

            <Panel title="Notes and signature">
              <div className="grid gap-4 md:grid-cols-2">
                <TextareaField id="paymentDescription" label="Payment description" value={receipt.paymentDescription} onChange={(value) => updateReceipt("paymentDescription", value)} />
                <TextareaField id="notes" label="Receipt notes" value={receipt.notes} onChange={(value) => updateReceipt("notes", value)} />
                <TextareaField id="thankYouMessage" label="Thank-you message" value={receipt.thankYouMessage} onChange={(value) => updateReceipt("thankYouMessage", value)} />
                <TextareaField id="acknowledgement" label="Acknowledgement statement" value={receipt.acknowledgement} onChange={(value) => updateReceipt("acknowledgement", value)} />
                <TextareaField id="terms" label="Terms" value={receipt.terms} onChange={(value) => updateReceipt("terms", value)} />
                <TextareaField id="refundPolicy" label="Refund policy" value={receipt.refundPolicy} onChange={(value) => updateReceipt("refundPolicy", value)} />
                <TextareaField id="internalNote" label="Internal note" value={receipt.internalNote} onChange={(value) => updateReceipt("internalNote", value)} />
                <TextField id="issuedBy" label="Issued by" value={receipt.issuedBy} onChange={(value) => updateReceipt("issuedBy", value)} inputClass={inputClass} />
                <label className="flex items-start gap-3 rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                  <input type="checkbox" checked={receipt.showInternalNote} onChange={(event) => updateReceipt("showInternalNote", event.target.checked)} className="mt-1" />
                  Show internal note on receipt
                </label>
                <label className="flex items-start gap-3 rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                  <input type="checkbox" checked={receipt.showSignature} onChange={(event) => updateReceipt("showSignature", event.target.checked)} className="mt-1" />
                  Show signature section
                </label>
                <label className="flex items-start gap-3 rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                  <input type="checkbox" checked={receipt.showCustomerSignature} onChange={(event) => updateReceipt("showCustomerSignature", event.target.checked)} className="mt-1" />
                  Include customer signature line
                </label>
                <label className="flex items-start gap-3 rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                  <input type="checkbox" checked={receipt.showBusinessStamp} onChange={(event) => updateReceipt("showBusinessStamp", event.target.checked)} className="mt-1" />
                  Include business stamp placeholder
                </label>
              </div>
            </Panel>

            <div className="rounded-[1.5rem] bg-[#f7f7f4] p-5 text-sm leading-7 text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
              Privacy note: receipt data and uploaded logos stay in this browser through localStorage. Anulen does not receive this information unless
              you choose to send it separately.
            </div>
          </div>

          <div className="receipt-preview-scroll lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <div className="receipt-no-print mb-4 flex items-center gap-3 rounded-[1.5rem] bg-black p-5 text-white dark:bg-white dark:text-black">
              <FileText size={20} />
              <div>
                <h2 className="text-lg font-black">Live preview</h2>
                <p className="text-sm opacity-70">This is what prints and exports to PDF.</p>
              </div>
            </div>
            <ReceiptPreview receipt={receipt} />
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

function TextField({ id, label, value, onChange, inputClass, errors = {}, type = "text", placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; inputClass: string; errors?: ReceiptValidationErrors; type?: string; placeholder?: string }) {
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

function NumberField({ id, label, value, onChange, inputClass, errors = {}, min, max, step, errorId }: { id: string; label: string; value: number; onChange: (value: number) => void; inputClass: string; errors?: ReceiptValidationErrors; min?: string; max?: string; step?: string; errorId?: string }) {
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

function DateField({ id, label, value, onChange, inputClass, errors = {} }: { id: string; label: string; value: string; onChange: (value: string) => void; inputClass: string; errors?: ReceiptValidationErrors }) {
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

function SelectField({ id, label, value, onChange, inputClass, options, optionValues }: { id: string; label: string; value: string; onChange: (value: string) => void; inputClass: string; options: string[]; optionValues?: string[] }) {
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

function TextareaField({ id, label, value, onChange, errors = {} }: { id: string; label: string; value: string; onChange: (value: string) => void; errors?: ReceiptValidationErrors }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#589037] focus:ring-2 focus:ring-[#589037]/20 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-neutral-500" placeholder="Optional" />
      <FieldError id={id} errors={errors} />
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
