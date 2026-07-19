"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Download, FileText, Plus, Printer, ReceiptText, RotateCcw, Save, Trash2, Upload, X } from "lucide-react";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import { calculateInvoiceTotals } from "@/lib/invoice/calculations";
import { currencies, formatMoney } from "@/lib/invoice/currency";
import { downloadInvoicePdf } from "@/lib/invoice/pdf";
import { clearInvoiceDraft, loadInvoiceDraft, saveInvoiceDraft } from "@/lib/invoice/storage";
import { invoiceToReceiptDraft } from "@/lib/receipt/fromInvoice";
import { receiptDraftKey, saveReceiptDraft } from "@/lib/receipt/storage";
import type { AccentColor, DiscountType, InvoiceData, InvoiceItem, InvoiceTemplate, PaymentStatus, ValidationErrors } from "@/lib/invoice/types";
import { generateInvoiceNumber } from "@/lib/invoice/invoiceNumber";
import { validateInvoice } from "@/lib/invoice/validation";
import AdSenseAd from "@/components/ads/AdSenseAd";
import { ADSENSE_SLOTS } from "@/lib/adsense";

const maxLogoSize = 1_000_000;

const accentColors: AccentColor[] = [
  { name: "Anulen green", value: "#589037" },
  { name: "Fresh lime", value: "#75b246" },
  { name: "Midnight", value: "#111111" },
  { name: "Blue", value: "#2563eb" },
  { name: "Slate", value: "#475569" },
];

const invoiceGuideSections = [
  {
    title: "What an invoice is",
    body: "An invoice is a payment request that records what was delivered, who should pay, the amount due, payment terms and the due date.",
  },
  {
    title: "How to create an invoice",
    body: "Add your business details, client details, invoice number, due date, products or services, taxes, discounts, notes and payment instructions. The preview updates as you edit.",
  },
  {
    title: "Invoice versus quotation",
    body: "A quotation is sent before approval to propose pricing. An invoice is sent after approval, delivery or a payment milestone to request payment.",
  },
  {
    title: "What an invoice should contain",
    body: "A clear invoice should include seller and buyer details, invoice number, issue date, due date, line items, taxes, totals, payment information and any important terms.",
  },
  {
    title: "When to send an invoice",
    body: "Send an invoice after work is completed, after goods are delivered, or at an agreed milestone. For larger projects, invoices can follow deposit or progress-payment terms.",
  },
  {
    title: "How data is stored",
    body: "Your invoice draft is stored locally in your browser. The tool does not upload invoice content or logo files to Anulen servers.",
  },
];

const invoiceFaqs = [
  {
    question: "Is the invoice generator free?",
    answer: "Yes. You can create, preview, print and download invoices without creating an account.",
  },
  {
    question: "Is my invoice information uploaded?",
    answer: "No. Invoice data and uploaded logos stay in your browser unless you choose to share the exported PDF yourself.",
  },
  {
    question: "Can I download the invoice as PDF?",
    answer: "Yes. Fill the required fields and use the Download PDF button to export a professional A4 invoice.",
  },
  {
    question: "Can I add my business logo?",
    answer: "Yes. The invoice generator supports PNG, JPG, JPEG and WebP logos up to the current upload limit.",
  },
  {
    question: "Can I use Nigerian naira?",
    answer: "Yes. Nigerian naira is supported along with USD, GBP, EUR, CAD, GHS and ZAR.",
  },
  {
    question: "Can I save my invoice and return later?",
    answer: "Yes. Drafts are saved in localStorage on the same browser and device.",
  },
  {
    question: "Should I create a quotation first?",
    answer: "Use a quotation when the customer needs to approve pricing before payment. Once accepted, you can create the final invoice.",
  },
  {
    question: "Can I print the invoice?",
    answer: "Yes. The Print invoice button prints only the invoice document, without the website navigation or form controls.",
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function makeItem(): InvoiceItem {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

  return {
    id,
    description: "",
    details: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
  };
}

function makeEmptyInvoice(): InvoiceData {
  return {
    businessName: "",
    businessLogo: "",
    businessAddress: "",
    businessEmail: "",
    businessPhone: "",
    businessWebsite: "",
    businessTaxId: "",
    businessInfo: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    clientTaxId: "",
    invoiceNumber: generateInvoiceNumber(),
    issueDate: today(),
    dueDate: futureDate(14),
    reference: "",
    status: "Draft",
    currency: "NGN",
    discountType: "percentage",
    discountValue: 0,
    shipping: 0,
    amountPaid: 0,
    notes: "",
    terms: "",
    paymentInstructions: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    paymentLink: "",
    template: "modern",
    accentColor: "#589037",
    items: [makeItem()],
  };
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasEnteredData(invoice: InvoiceData) {
  const empty = makeEmptyInvoice();
  return JSON.stringify({ ...invoice, invoiceNumber: "", issueDate: "", dueDate: "", items: [] }) !== JSON.stringify({ ...empty, invoiceNumber: "", issueDate: "", dueDate: "", items: [] });
}

function FieldError({ id, errors }: { id: string; errors: ValidationErrors }) {
  if (!errors[id]) return null;

  return <p className="mt-2 text-xs leading-5 text-red-600">{errors[id]}</p>;
}

export default function InvoiceGenerator() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData>(() => makeEmptyInvoice());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [notice, setNotice] = useState("");
  const [logoError, setLogoError] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  const totals = useMemo(() => calculateInvoiceTotals(invoice), [invoice]);
  const colorPickerValue = /^#[0-9a-fA-F]{6}$/.test(invoice.accentColor) ? invoice.accentColor : "#589037";

  useEffect(() => {
    const savedDraft = loadInvoiceDraft();
    if (savedDraft) {
      setInvoice({ ...makeEmptyInvoice(), ...savedDraft, items: savedDraft.items?.length ? savedDraft.items : [makeItem()] });
      setNotice("Saved draft restored.");
    }
    setHasLoadedDraft(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedDraft) return;

    const timer = window.setTimeout(() => {
      saveInvoiceDraft(invoice);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [hasLoadedDraft, invoice]);

  const updateInvoice = <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    setInvoice((current) => ({ ...current, [key]: value }));
  };

  const updateItem = <K extends keyof InvoiceItem>(id: string, key: K, value: InvoiceItem[K]) => {
    setInvoice((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  };

  const addItem = () => {
    setInvoice((current) => ({ ...current, items: [...current.items, makeItem()] }));
  };

  const removeItem = (id: string) => {
    setInvoice((current) => (current.items.length === 1 ? current : { ...current, items: current.items.filter((item) => item.id !== id) }));
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
      setLogoError("Logo must be 1MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateInvoice("businessLogo", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveDraft = () => {
    saveInvoiceDraft(invoice);
    setNotice("Draft saved on this browser.");
  };

  const clearInvoice = () => {
    if (hasEnteredData(invoice) && !window.confirm("Clear this invoice and remove the saved draft?")) return;

    clearInvoiceDraft();
    setInvoice(makeEmptyInvoice());
    setErrors({});
    setLogoError("");
    setNotice("Invoice cleared.");
  };

  const validateBeforeExport = () => {
    const nextErrors = validateInvoice(invoice);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setNotice("Fix the highlighted fields before downloading the PDF.");
      return false;
    }

    return true;
  };

  const downloadPdf = async () => {
    if (!validateBeforeExport()) return;

    setIsGeneratingPdf(true);
    setNotice("");

    try {
      await downloadInvoicePdf(invoice);
      setNotice("PDF downloaded.");
    } catch {
      setNotice("PDF generation failed. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const printInvoice = () => {
    if (!validateBeforeExport()) return;
    window.print();
  };

  const createReceipt = () => {
    if (!validateBeforeExport()) return;
    if (localStorage.getItem(receiptDraftKey) && !window.confirm("A receipt draft already exists. Continuing will replace it with this invoice.")) return;

    const amountInput = window.prompt("Amount received for this receipt:", String(totals.balanceDue || totals.grandTotal));
    if (amountInput === null) return;

    const amountReceived = Number(amountInput);
    if (!Number.isFinite(amountReceived) || amountReceived < 0) {
      setNotice("Enter a valid amount received before creating the receipt.");
      return;
    }

    saveReceiptDraft(invoiceToReceiptDraft(invoice, amountReceived));
    router.push("/receipt-generator");
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#589037] focus:ring-2 focus:ring-[#589037]/20 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-neutral-500";
  const labelClass = "block text-sm font-bold";

  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="invoice-no-print px-6 pb-4 pt-4 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#589037]">Invoice Generator</p>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="mr-auto flex flex-wrap gap-4 text-sm">
              <Link href="/quotation-generator" className="inline-flex font-bold text-[#589037]">
                Need a quotation first?
              </Link>
              <Link href="/receipt-generator" className="inline-flex font-bold text-[#589037]">
                Need a receipt?
              </Link>
            </div>
            <button onClick={saveDraft} className="inline-flex items-center gap-3 rounded-full border border-black px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
              <Save size={17} />
              Save draft
            </button>
            <button onClick={clearInvoice} className="inline-flex items-center gap-3 rounded-full border border-black/20 px-5 py-3 text-sm font-bold transition hover:border-red-600 hover:text-red-600 dark:border-white/30">
              <RotateCcw size={17} />
              Clear invoice
            </button>
            <button onClick={printInvoice} className="inline-flex items-center gap-3 rounded-full border border-black px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
              <Printer size={17} />
              Print invoice
            </button>
            <button onClick={createReceipt} className="inline-flex items-center gap-3 rounded-full border border-black px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
              <ReceiptText size={17} />
              Create receipt
            </button>
            <button
              onClick={downloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-3 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
            >
              <Download size={17} />
              {isGeneratingPdf ? "Generating..." : "Download PDF"}
            </button>
          </div>
          {notice && (
            <div className="mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-black/10 bg-[#f7f7f4] p-4 text-sm dark:border-white/10 dark:bg-white/10">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#589037]" />
              <p>{notice}</p>
            </div>
          )}
        </div>
      </section>

      <AdSenseAd slot={ADSENSE_SLOTS.top} />

      <section className="px-3 pb-10 dark:bg-black">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2 lg:items-start">
          <div className="invoice-no-print grid gap-5 rounded-[2rem] bg-white p-4 shadow-sm dark:bg-black md:p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <Panel title="Business details">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="businessName">
                    Business name
                  </label>
                  <input id="businessName" value={invoice.businessName} onChange={(event) => updateInvoice("businessName", event.target.value)} className={inputClass} placeholder="Your company name" />
                  <FieldError id="businessName" errors={errors} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="businessLogo">
                    Business logo
                  </label>
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-black/20 bg-[#f7f7f4] px-4 py-3 text-sm transition hover:border-[#589037] dark:border-white/20 dark:bg-black">
                    <Upload size={17} />
                    Upload logo
                    <input id="businessLogo" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="sr-only" />
                  </label>
                  {invoice.businessLogo && (
                    <button type="button" onClick={() => updateInvoice("businessLogo", "")} className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-red-600">
                      <X size={14} />
                      Remove logo
                    </button>
                  )}
                  {logoError && <p className="mt-2 text-xs text-red-600">{logoError}</p>}
                </div>
                <TextareaField id="businessAddress" label="Business address" value={invoice.businessAddress} onChange={(value) => updateInvoice("businessAddress", value)} />
                <TextareaField id="businessInfo" label="Additional business information" value={invoice.businessInfo} onChange={(value) => updateInvoice("businessInfo", value)} />
                <TextField id="businessEmail" label="Email address" value={invoice.businessEmail} onChange={(value) => updateInvoice("businessEmail", value)} errors={errors} inputClass={inputClass} type="email" />
                <TextField id="businessPhone" label="Phone number" value={invoice.businessPhone} onChange={(value) => updateInvoice("businessPhone", value)} inputClass={inputClass} />
                <TextField id="businessWebsite" label="Website" value={invoice.businessWebsite} onChange={(value) => updateInvoice("businessWebsite", value)} inputClass={inputClass} placeholder="https://example.com" />
                <TextField id="businessTaxId" label="Tax identification number" value={invoice.businessTaxId} onChange={(value) => updateInvoice("businessTaxId", value)} inputClass={inputClass} />
              </div>
            </Panel>

            <Panel title="Client details">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField id="clientName" label="Client name" value={invoice.clientName} onChange={(value) => updateInvoice("clientName", value)} errors={errors} inputClass={inputClass} placeholder="Client or company name" />
                <TextField id="clientEmail" label="Client email" value={invoice.clientEmail} onChange={(value) => updateInvoice("clientEmail", value)} errors={errors} inputClass={inputClass} type="email" />
                <TextField id="clientPhone" label="Client phone" value={invoice.clientPhone} onChange={(value) => updateInvoice("clientPhone", value)} inputClass={inputClass} />
                <TextField id="clientTaxId" label="Client tax identification number" value={invoice.clientTaxId} onChange={(value) => updateInvoice("clientTaxId", value)} inputClass={inputClass} />
                <div className="md:col-span-2">
                  <TextareaField id="clientAddress" label="Client billing address" value={invoice.clientAddress} onChange={(value) => updateInvoice("clientAddress", value)} />
                </div>
              </div>
            </Panel>

            <Panel title="Invoice information">
              <div className="grid gap-4 md:grid-cols-3">
                <TextField id="invoiceNumber" label="Invoice number" value={invoice.invoiceNumber} onChange={(value) => updateInvoice("invoiceNumber", value)} errors={errors} inputClass={inputClass} />
                <DateField id="issueDate" label="Issue date" value={invoice.issueDate} onChange={(value) => updateInvoice("issueDate", value)} inputClass={inputClass} />
                <DateField id="dueDate" label="Due date" value={invoice.dueDate} onChange={(value) => updateInvoice("dueDate", value)} errors={errors} inputClass={inputClass} />
                <TextField id="reference" label="PO or reference" value={invoice.reference} onChange={(value) => updateInvoice("reference", value)} inputClass={inputClass} />
                <SelectField id="status" label="Payment status" value={invoice.status} onChange={(value) => updateInvoice("status", value as PaymentStatus)} inputClass={inputClass} options={["Draft", "Unpaid", "Paid"]} />
                <SelectField id="currency" label="Currency" value={invoice.currency} onChange={(value) => updateInvoice("currency", value as InvoiceData["currency"])} inputClass={inputClass} options={currencies.map((currency) => `${currency.code} - ${currency.label}`)} optionValues={currencies.map((currency) => currency.code)} />
              </div>
            </Panel>

            <Panel title="Invoice items">
              {errors.items && <p className="mb-4 text-sm text-red-600">{errors.items}</p>}
              <div className="grid gap-4">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className="rounded-[1.5rem] border border-black/10 bg-[#f7f7f4] p-4 dark:border-white/10 dark:bg-black">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-sm font-black">Item {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={invoice.items.length === 1}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[1fr_0.7fr_0.7fr_0.7fr]">
                      <div>
                        <label className={labelClass} htmlFor={`description-${item.id}`}>
                          Description
                        </label>
                        <input id={`description-${item.id}`} value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} className={inputClass} placeholder="Design services" />
                      </div>
                      <NumberField id={`quantity-${item.id}`} label="Quantity" value={item.quantity} onChange={(value) => updateItem(item.id, "quantity", Math.max(value, 0))} inputClass={inputClass} min="0.01" step="0.01" />
                      <NumberField id={`unitPrice-${item.id}`} label="Unit price" value={item.unitPrice} onChange={(value) => updateItem(item.id, "unitPrice", Math.max(value, 0))} inputClass={inputClass} min="0" step="0.01" />
                      <NumberField id={`tax-${item.id}`} label="Tax %" value={item.taxRate} onChange={(value) => updateItem(item.id, "taxRate", Math.min(Math.max(value, 0), 100))} inputClass={inputClass} min="0" max="100" step="0.01" />
                      <div className="md:col-span-3">
                        <label className={labelClass} htmlFor={`details-${item.id}`}>
                          Additional details
                        </label>
                        <textarea id={`details-${item.id}`} value={item.details} onChange={(event) => updateItem(item.id, "details", event.target.value)} className={`${inputClass} min-h-20 resize-y`} placeholder="Optional notes for this line item" />
                      </div>
                      <div className="rounded-2xl bg-white p-4 text-sm dark:bg-white/10">
                        <p className="text-neutral-500 dark:text-neutral-300">Line total</p>
                        <p className="mt-1 text-lg font-black">{formatMoney(totals.lines.find((line) => line.id === item.id)?.total || 0, invoice.currency)}</p>
                      </div>
                    </div>
                    <FieldError id={`items.${item.id}.quantity`} errors={errors} />
                    <FieldError id={`items.${item.id}.unitPrice`} errors={errors} />
                    <FieldError id={`items.${item.id}.taxRate`} errors={errors} />
                  </div>
                ))}
              </div>
              <button type="button" onClick={addItem} className="mt-4 inline-flex items-center gap-3 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] dark:bg-white dark:text-black">
                <Plus size={17} />
                Add item
              </button>
            </Panel>

            <Panel title="Totals, template and payment">
              <div className="grid gap-4 md:grid-cols-3">
                <SelectField id="discountType" label="Discount type" value={invoice.discountType} onChange={(value) => updateInvoice("discountType", value as DiscountType)} inputClass={inputClass} options={["percentage", "fixed"]} />
                <NumberField id="discountValue" label="Discount value" value={invoice.discountValue} onChange={(value) => updateInvoice("discountValue", Math.max(value, 0))} errors={errors} inputClass={inputClass} min="0" step="0.01" />
                <NumberField id="shipping" label="Shipping or additional charge" value={invoice.shipping} onChange={(value) => updateInvoice("shipping", Math.max(value, 0))} errors={errors} inputClass={inputClass} min="0" step="0.01" />
                <NumberField id="amountPaid" label="Amount paid" value={invoice.amountPaid} onChange={(value) => updateInvoice("amountPaid", Math.max(value, 0))} errors={errors} inputClass={inputClass} min="0" step="0.01" />
                <SelectField id="template" label="Invoice template" value={invoice.template} onChange={(value) => updateInvoice("template", value as InvoiceTemplate)} inputClass={inputClass} options={["modern", "minimal"]} />
                <div>
                  <label className={labelClass}>Accent colour</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => updateInvoice("accentColor", color.value)}
                        className={`h-10 w-10 rounded-full border-2 ${invoice.accentColor === color.value ? "border-black dark:border-white" : "border-transparent"}`}
                        style={{ backgroundColor: color.value }}
                        aria-label={`Use ${color.name} accent colour`}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      id="customAccentColor"
                      type="color"
                      value={colorPickerValue}
                      onChange={(event) => updateInvoice("accentColor", event.target.value)}
                      className="h-12 w-16 cursor-pointer rounded-2xl border border-black/10 bg-[#f7f7f4] p-1 dark:border-white/10 dark:bg-black"
                      aria-label="Choose custom accent colour"
                    />
                    <input
                      value={invoice.accentColor}
                      onChange={(event) => updateInvoice("accentColor", event.target.value)}
                      className={inputClass}
                      aria-label="Custom accent colour hex value"
                      placeholder="#589037"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 rounded-[1.5rem] bg-[#f7f7f4] p-5 text-sm dark:bg-white/10">
                <SummaryRow label="Subtotal" value={formatMoney(totals.subtotal, invoice.currency)} />
                <SummaryRow label="Discount" value={`-${formatMoney(totals.discount, invoice.currency)}`} />
                <SummaryRow label="Tax" value={formatMoney(totals.tax, invoice.currency)} />
                <SummaryRow label="Additional charges" value={formatMoney(totals.shipping, invoice.currency)} />
                <SummaryRow label="Grand total" value={formatMoney(totals.grandTotal, invoice.currency)} strong />
                <SummaryRow label="Balance due" value={formatMoney(totals.balanceDue, invoice.currency)} strong />
              </div>
            </Panel>

            <Panel title="Notes and payment details">
              <div className="grid gap-4 md:grid-cols-2">
                <TextareaField id="notes" label="Invoice notes" value={invoice.notes} onChange={(value) => updateInvoice("notes", value)} />
                <TextareaField id="terms" label="Terms and conditions" value={invoice.terms} onChange={(value) => updateInvoice("terms", value)} />
                <TextareaField id="paymentInstructions" label="Payment instructions" value={invoice.paymentInstructions} onChange={(value) => updateInvoice("paymentInstructions", value)} />
                <TextField id="paymentLink" label="Payment link" value={invoice.paymentLink} onChange={(value) => updateInvoice("paymentLink", value)} inputClass={inputClass} placeholder="https://..." />
                <TextField id="bankName" label="Bank name" value={invoice.bankName} onChange={(value) => updateInvoice("bankName", value)} inputClass={inputClass} />
                <TextField id="accountName" label="Account name" value={invoice.accountName} onChange={(value) => updateInvoice("accountName", value)} inputClass={inputClass} />
                <TextField id="accountNumber" label="Account number" value={invoice.accountNumber} onChange={(value) => updateInvoice("accountNumber", value)} inputClass={inputClass} />
              </div>
            </Panel>
          </div>

          <div className="invoice-preview-scroll lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <div className="invoice-no-print mb-4 flex items-center gap-3 rounded-[1.5rem] bg-black p-5 text-white dark:bg-white dark:text-black">
              <FileText size={20} />
              <div>
                <h2 className="text-lg font-black">Live preview</h2>
                <p className="text-sm opacity-70">This is what prints and exports to PDF.</p>
              </div>
            </div>
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </section>

      <AdSenseAd slot={ADSENSE_SLOTS.middle} />

      <section className="invoice-no-print px-6 pb-24 pt-10 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <p className="mb-4 text-sm font-bold text-[#589037]">Invoice guide</p>
              <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">Create clearer invoices after work is approved.</h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-300">
                Use this generator to prepare a professional invoice, or start with the related{" "}
                <Link href="/quotation-generator" className="font-bold text-[#589037]">
                  quotation generator
                </Link>{" "}
                when a customer needs to approve pricing first.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {invoiceGuideSections.map((section) => (
                <article key={section.title} className="rounded-[1.5rem] bg-[#f7f7f4] p-6 dark:bg-white/10">
                  <h3 className="text-lg font-black tracking-[-0.03em]">{section.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-500 dark:text-neutral-300">{section.body}</p>
                </article>
              ))}
            </div>
          </div>

          <AdSenseAd slot={ADSENSE_SLOTS.bottom} className="px-0 md:px-0 lg:px-0" />

          <div className="mt-20">
            <p className="mb-4 text-sm font-bold text-[#589037]">FAQ</p>
            <h2 className="text-4xl font-black tracking-[-0.05em] md:text-5xl">Frequently asked questions</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {invoiceFaqs.map((faq) => (
                <details key={faq.question} className="group rounded-[1.5rem] bg-[#f7f7f4] p-6 dark:bg-white/10">
                  <summary className="cursor-pointer list-none text-base font-black">
                    {faq.question}
                    <span className="float-right text-[#589037] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-neutral-500 dark:text-neutral-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
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
  errors?: ValidationErrors;
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
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  inputClass: string;
  errors?: ValidationErrors;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <input id={id} type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(numberValue(event.target.value))} className={inputClass} />
      <FieldError id={id} errors={errors} />
    </div>
  );
}

function DateField({ id, label, value, onChange, inputClass, errors = {} }: { id: string; label: string; value: string; onChange: (value: string) => void; inputClass: string; errors?: ValidationErrors }) {
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
