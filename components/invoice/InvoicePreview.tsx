"use client";

import { calculateInvoiceTotals } from "@/lib/invoice/calculations";
import { formatMoney } from "@/lib/invoice/currency";
import type { InvoiceData } from "@/lib/invoice/types";

function optionalLines(lines: Array<string | false>) {
  return lines.filter(Boolean) as string[];
}

export default function InvoicePreview({ invoice }: { invoice: InvoiceData }) {
  const totals = calculateInvoiceTotals(invoice);
  const isMinimal = invoice.template === "minimal";
  const shownItems = invoice.items.filter((item) => item.description.trim() || item.unitPrice > 0 || item.quantity > 0);
  const paymentLines = optionalLines([
    invoice.paymentInstructions && `Instructions: ${invoice.paymentInstructions}`,
    invoice.bankName && `Bank: ${invoice.bankName}`,
    invoice.accountName && `Account name: ${invoice.accountName}`,
    invoice.accountNumber && `Account number: ${invoice.accountNumber}`,
    invoice.paymentLink && `Payment link: ${invoice.paymentLink}`,
  ]);

  return (
    <article
      className={`invoice-print-area mx-auto min-h-[1120px] w-full max-w-[850px] bg-white p-6 text-black shadow-xl md:p-10 ${
        isMinimal ? "border-t-[6px]" : "rounded-[0.4rem] border-t-[10px]"
      }`}
      style={{ borderColor: invoice.accentColor }}
    >
      <header className="flex flex-col gap-8 border-b border-black/10 pb-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          {invoice.businessLogo && (
            <img src={invoice.businessLogo} alt={`${invoice.businessName || "Business"} logo`} className="mb-5 max-h-20 max-w-40 object-contain" />
          )}
          <h2 className="text-2xl font-black tracking-[-0.04em]">{invoice.businessName || "Business name"}</h2>
          <div className="mt-3 space-y-1 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
            {invoice.businessAddress && <p>{invoice.businessAddress}</p>}
            {invoice.businessEmail && <p>{invoice.businessEmail}</p>}
            {invoice.businessPhone && <p>{invoice.businessPhone}</p>}
            {invoice.businessWebsite && <p>{invoice.businessWebsite}</p>}
            {invoice.businessTaxId && <p>Tax ID: {invoice.businessTaxId}</p>}
            {invoice.businessInfo && <p>{invoice.businessInfo}</p>}
          </div>
        </div>

        <div className="text-left md:text-right">
          <h1 className="text-5xl font-black tracking-[-0.06em]" style={{ color: invoice.accentColor }}>
            Invoice
          </h1>
          <div className="mt-5 space-y-2 text-sm text-neutral-600">
            <p>
              <span className="text-black">Number:</span> {invoice.invoiceNumber || "-"}
            </p>
            <p>
              <span className="text-black">Issue date:</span> {invoice.issueDate || "-"}
            </p>
            <p>
              <span className="text-black">Due date:</span> {invoice.dueDate || "-"}
            </p>
            {invoice.reference && (
              <p>
                <span className="text-black">Reference:</span> {invoice.reference}
              </p>
            )}
          </div>
          <span
            className="mt-4 inline-flex rounded-full px-4 py-2 text-xs font-bold"
            style={{
              backgroundColor: invoice.status === "Paid" ? "#e9f8df" : invoice.status === "Draft" ? "#eeeeee" : "#fff4d8",
              color: invoice.status === "Paid" ? "#2f6f1f" : "#111111",
            }}
          >
            {invoice.status}
          </span>
        </div>
      </header>

      <section className="grid gap-8 py-8 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: invoice.accentColor }}>
            Bill to
          </p>
          <h3 className="text-xl font-black">{invoice.clientName || "Client name"}</h3>
          <div className="mt-3 space-y-1 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
            {invoice.clientAddress && <p>{invoice.clientAddress}</p>}
            {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
            {invoice.clientPhone && <p>{invoice.clientPhone}</p>}
            {invoice.clientTaxId && <p>Tax ID: {invoice.clientTaxId}</p>}
          </div>
        </div>
      </section>

      <section className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className={isMinimal ? "border-y border-black/15" : "text-white"} style={{ backgroundColor: isMinimal ? "transparent" : invoice.accentColor }}>
              <th className="py-4 pr-4 text-left">Item</th>
              <th className="px-4 py-4 text-right">Qty</th>
              <th className="px-4 py-4 text-right">Price</th>
              <th className="px-4 py-4 text-right">Tax</th>
              <th className="py-4 pl-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {shownItems.length ? (
              shownItems.map((item) => {
                const line = totals.lines.find((entry) => entry.id === item.id);

                return (
                  <tr key={item.id} className="break-inside-avoid border-b border-black/10 align-top">
                    <td className="max-w-[280px] py-4 pr-4">
                      <p className="font-bold">{item.description || "Item"}</p>
                      {item.details && <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-neutral-500">{item.details}</p>}
                    </td>
                    <td className="px-4 py-4 text-right">{item.quantity}</td>
                    <td className="px-4 py-4 text-right">{formatMoney(item.unitPrice, invoice.currency)}</td>
                    <td className="px-4 py-4 text-right">{formatMoney(line?.tax || 0, invoice.currency)}</td>
                    <td className="py-4 pl-4 text-right font-bold">{formatMoney(line?.total || 0, invoice.currency)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-neutral-500">
                  Add invoice items to preview them here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="ml-auto mt-8 w-full max-w-sm space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-500">Subtotal</span>
          <span>{formatMoney(totals.subtotal, invoice.currency)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between">
            <span className="text-neutral-500">Discount</span>
            <span>-{formatMoney(totals.discount, invoice.currency)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-neutral-500">Tax</span>
          <span>{formatMoney(totals.tax, invoice.currency)}</span>
        </div>
        {totals.shipping > 0 && (
          <div className="flex justify-between">
            <span className="text-neutral-500">Additional charges</span>
            <span>{formatMoney(totals.shipping, invoice.currency)}</span>
          </div>
        )}
        <div className="flex justify-between border-t-2 pt-4 text-lg font-black" style={{ borderColor: invoice.accentColor }}>
          <span>Total</span>
          <span>{formatMoney(totals.grandTotal, invoice.currency)}</span>
        </div>
        {totals.amountPaid > 0 && (
          <div className="flex justify-between">
            <span className="text-neutral-500">Amount paid</span>
            <span>{formatMoney(totals.amountPaid, invoice.currency)}</span>
          </div>
        )}
        <div className="flex justify-between rounded-2xl p-4 text-lg font-black text-white" style={{ backgroundColor: invoice.accentColor }}>
          <span>Balance due</span>
          <span>{formatMoney(totals.balanceDue, invoice.currency)}</span>
        </div>
      </section>

      <section className="mt-10 grid gap-6 text-sm leading-7 md:grid-cols-2">
        {invoice.notes && (
          <div className="break-inside-avoid">
            <h3 className="mb-2 font-black" style={{ color: invoice.accentColor }}>
              Notes
            </h3>
            <p className="whitespace-pre-wrap text-neutral-600">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div className="break-inside-avoid">
            <h3 className="mb-2 font-black" style={{ color: invoice.accentColor }}>
              Terms
            </h3>
            <p className="whitespace-pre-wrap text-neutral-600">{invoice.terms}</p>
          </div>
        )}
        {paymentLines.length > 0 && (
          <div className="break-inside-avoid md:col-span-2">
            <h3 className="mb-2 font-black" style={{ color: invoice.accentColor }}>
              Payment details
            </h3>
            <div className="space-y-1 text-neutral-600">
              {paymentLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </section>
    </article>
  );
}
