"use client";

import { calculateQuotationTotals } from "@/lib/quotation/calculations";
import { formatMoney } from "@/lib/invoice/currency";
import type { QuotationData } from "@/lib/quotation/types";

function optionalLines(lines: Array<string | false>) {
  return lines.filter(Boolean) as string[];
}

export default function QuotationPreview({ quotation }: { quotation: QuotationData }) {
  const totals = calculateQuotationTotals(quotation);
  const isMinimal = quotation.template === "minimal";
  const shownItems = quotation.items.filter((item) => item.name.trim() || item.description.trim() || item.unitPrice > 0);
  const projectLines = optionalLines([
    quotation.projectName && `Project: ${quotation.projectName}`,
    quotation.reference && `Reference: ${quotation.reference}`,
    quotation.salesRepresentative && `Sales rep: ${quotation.salesRepresentative}`,
  ]);
  const noteLines = optionalLines([
    quotation.introductoryMessage,
    quotation.notes && `Notes: ${quotation.notes}`,
    quotation.deliveryTimeline && `Delivery timeline: ${quotation.deliveryTimeline}`,
    quotation.estimatedCompletionTime && `Estimated completion: ${quotation.estimatedCompletionTime}`,
    quotation.warrantyInformation && `Warranty: ${quotation.warrantyInformation}`,
  ]);
  const paymentLines = optionalLines([
    quotation.paymentTerms && `Payment terms: ${quotation.paymentTerms}`,
    quotation.bankDetails && `Bank details: ${quotation.bankDetails}`,
    quotation.paymentLink && `Payment link: ${quotation.paymentLink}`,
  ]);

  return (
    <article
      className={`quotation-print-area mx-auto min-h-[1120px] w-full max-w-[850px] bg-white p-6 text-black shadow-xl md:p-10 ${
        isMinimal ? "border-t-[6px]" : "rounded-[0.4rem] border-t-[10px]"
      }`}
      style={{ borderColor: quotation.accentColor }}
    >
      <header className="flex flex-col gap-8 border-b border-black/10 pb-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          {quotation.businessLogo && <img src={quotation.businessLogo} alt={`${quotation.businessName || "Business"} logo`} className="mb-5 max-h-20 max-w-40 object-contain" />}
          <h2 className="text-2xl font-black tracking-[-0.04em]">{quotation.businessName || "Business name"}</h2>
          <div className="mt-3 space-y-1 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
            {quotation.businessAddress && <p>{quotation.businessAddress}</p>}
            {quotation.businessEmail && <p>{quotation.businessEmail}</p>}
            {quotation.businessPhone && <p>{quotation.businessPhone}</p>}
            {quotation.businessWebsite && <p>{quotation.businessWebsite}</p>}
            {quotation.businessTaxId && <p>Tax ID: {quotation.businessTaxId}</p>}
            {quotation.businessRegistrationNumber && <p>Registration: {quotation.businessRegistrationNumber}</p>}
            {quotation.businessInfo && <p>{quotation.businessInfo}</p>}
          </div>
        </div>

        <div className="text-left md:text-right">
          <h1 className="text-5xl font-black tracking-[-0.06em]" style={{ color: quotation.accentColor }}>
            Quotation
          </h1>
          <div className="mt-5 space-y-2 text-sm text-neutral-600">
            <p>
              <span className="text-black">Number:</span> {quotation.quotationNumber || "-"}
            </p>
            <p>
              <span className="text-black">Issue date:</span> {quotation.issueDate || "-"}
            </p>
            <p>
              <span className="text-black">Valid until:</span> {quotation.validUntil || "-"}
            </p>
          </div>
          <span className="mt-4 inline-flex rounded-full px-4 py-2 text-xs font-bold" style={{ backgroundColor: "#eeeeee", color: "#111111" }}>
            {quotation.status}
          </span>
        </div>
      </header>

      <section className="grid gap-8 py-8 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: quotation.accentColor }}>
            Quote to
          </p>
          <h3 className="text-xl font-black">{quotation.customerName || "Customer name"}</h3>
          <div className="mt-3 space-y-1 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
            {quotation.contactPerson && <p>Contact: {quotation.contactPerson}</p>}
            {quotation.customerAddress && <p>{quotation.customerAddress}</p>}
            {quotation.customerEmail && <p>{quotation.customerEmail}</p>}
            {quotation.customerPhone && <p>{quotation.customerPhone}</p>}
            {quotation.customerTaxId && <p>Tax ID: {quotation.customerTaxId}</p>}
          </div>
        </div>

        {projectLines.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: quotation.accentColor }}>
              Quotation details
            </p>
            <div className="space-y-1 text-sm leading-6 text-neutral-600">
              {projectLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className={isMinimal ? "border-y border-black/15" : "text-white"} style={{ backgroundColor: isMinimal ? "transparent" : quotation.accentColor }}>
              <th className="py-4 pr-4 text-left">Item</th>
              <th className="px-3 py-4 text-right">Unit</th>
              <th className="px-3 py-4 text-right">Qty</th>
              <th className="px-3 py-4 text-right">Price</th>
              <th className="px-3 py-4 text-right">Discount</th>
              <th className="px-3 py-4 text-right">Tax</th>
              <th className="py-4 pl-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {shownItems.length ? (
              shownItems.map((item) => {
                const line = totals.lines.find((entry) => entry.id === item.id);

                return (
                  <tr key={item.id} className="break-inside-avoid border-b border-black/10 align-top">
                    <td className="max-w-[260px] py-4 pr-4">
                      <p className="font-bold">{item.name || "Item"}</p>
                      {item.description && <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-neutral-500">{item.description}</p>}
                    </td>
                    <td className="px-3 py-4 text-right">{item.unit || "-"}</td>
                    <td className="px-3 py-4 text-right">{item.quantity}</td>
                    <td className="px-3 py-4 text-right">{formatMoney(item.unitPrice, quotation.currency)}</td>
                    <td className="px-3 py-4 text-right">{formatMoney(line?.discount || 0, quotation.currency)}</td>
                    <td className="px-3 py-4 text-right">{formatMoney(line?.tax || 0, quotation.currency)}</td>
                    <td className="py-4 pl-3 text-right font-bold">{formatMoney(line?.total || 0, quotation.currency)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-500">
                  Add quotation items to preview them here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="ml-auto mt-8 w-full max-w-sm space-y-3 text-sm">
        <PreviewRow label="Subtotal" value={formatMoney(totals.subtotal, quotation.currency)} />
        {totals.lineDiscount > 0 && <PreviewRow label="Line discounts" value={`-${formatMoney(totals.lineDiscount, quotation.currency)}`} />}
        <PreviewRow label="Tax" value={formatMoney(totals.tax, quotation.currency)} />
        {totals.overallDiscount > 0 && <PreviewRow label="Overall discount" value={`-${formatMoney(totals.overallDiscount, quotation.currency)}`} />}
        {totals.shipping > 0 && <PreviewRow label="Shipping" value={formatMoney(totals.shipping, quotation.currency)} />}
        {totals.additionalCharge > 0 && <PreviewRow label="Additional charge" value={formatMoney(totals.additionalCharge, quotation.currency)} />}
        <div className="flex justify-between border-t-2 pt-4 text-lg font-black" style={{ borderColor: quotation.accentColor }}>
          <span>Grand total</span>
          <span>{formatMoney(totals.grandTotal, quotation.currency)}</span>
        </div>
        {totals.depositRequired > 0 && (
          <>
            <PreviewRow label="Deposit required" value={formatMoney(totals.depositRequired, quotation.currency)} />
            <PreviewRow label="Balance after deposit" value={formatMoney(totals.balanceAfterDeposit, quotation.currency)} />
          </>
        )}
      </section>

      <section className="mt-10 grid gap-6 text-sm leading-7 md:grid-cols-2">
        {noteLines.length > 0 && (
          <div className="break-inside-avoid">
            <h3 className="mb-2 font-black" style={{ color: quotation.accentColor }}>
              Notes
            </h3>
            <div className="space-y-2 whitespace-pre-wrap text-neutral-600">
              {noteLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        )}
        {quotation.terms && (
          <div className="break-inside-avoid">
            <h3 className="mb-2 font-black" style={{ color: quotation.accentColor }}>
              Terms and conditions
            </h3>
            <p className="whitespace-pre-wrap text-neutral-600">{quotation.terms}</p>
          </div>
        )}
        {paymentLines.length > 0 && (
          <div className="break-inside-avoid md:col-span-2">
            <h3 className="mb-2 font-black" style={{ color: quotation.accentColor }}>
              Payment details
            </h3>
            <div className="space-y-1 whitespace-pre-wrap text-neutral-600">
              {paymentLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        )}
        {quotation.showAcceptance && (
          <div className="break-inside-avoid border-t border-black/10 pt-6 md:col-span-2">
            <h3 className="mb-2 font-black" style={{ color: quotation.accentColor }}>
              Customer acceptance
            </h3>
            <p className="text-neutral-600">{quotation.acceptanceInstructions || "I accept this quotation and authorize the work described above."}</p>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <div className="border-t border-black pt-3 text-sm text-neutral-600">Customer name / signature</div>
              <div className="border-t border-black pt-3 text-sm text-neutral-600">Date</div>
            </div>
          </div>
        )}
      </section>
    </article>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-neutral-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}
