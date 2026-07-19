"use client";

import { calculateReceiptTotals } from "@/lib/receipt/calculations";
import { formatMoney } from "@/lib/invoice/currency";
import type { ReceiptData } from "@/lib/receipt/types";

function optionalLines(lines: Array<string | false>) {
  return lines.filter(Boolean) as string[];
}

function paymentDetailLines(receipt: ReceiptData) {
  return optionalLines([
    `Method: ${receipt.paymentMethod === "Other" ? receipt.customPaymentMethod || "Other" : receipt.paymentMethod}`,
    receipt.bankName && `Bank: ${receipt.bankName}`,
    receipt.accountName && `Account name: ${receipt.accountName}`,
    receipt.transactionReference && `Reference: ${receipt.transactionReference}`,
    receipt.transactionId && `Transaction ID: ${receipt.transactionId}`,
    receipt.cardLastFour && `Card last four: ${receipt.cardLastFour}`,
    receipt.terminalReference && `Terminal reference: ${receipt.terminalReference}`,
    receipt.cardType && `Card type: ${receipt.cardType}`,
    receipt.chequeNumber && `Cheque number: ${receipt.chequeNumber}`,
    receipt.chequeDate && `Cheque date: ${receipt.chequeDate}`,
    receipt.paymentProvider && `Provider: ${receipt.paymentProvider}`,
  ]);
}

export default function ReceiptPreview({ receipt }: { receipt: ReceiptData }) {
  const totals = calculateReceiptTotals(receipt);
  const compact = receipt.template === "compact";
  const isMinimal = receipt.template === "minimal";
  const shownItems = receipt.items.filter((item) => item.name.trim() || item.description.trim() || item.unitPrice > 0);
  const customerName = receipt.anonymousCustomer ? "Walk-in Customer" : receipt.customerName || "Customer name";
  const paymentLines = paymentDetailLines(receipt);
  const noteLines = optionalLines([
    receipt.acknowledgement,
    receipt.notes && `Notes: ${receipt.notes}`,
    receipt.thankYouMessage,
    receipt.terms && `Terms: ${receipt.terms}`,
    receipt.refundPolicy && `Refund policy: ${receipt.refundPolicy}`,
    receipt.showInternalNote && receipt.internalNote && `Internal note: ${receipt.internalNote}`,
  ]);

  return (
    <article
      className={`receipt-print-area mx-auto min-h-[1120px] w-full bg-white p-6 text-black shadow-xl md:p-10 ${
        compact ? "max-w-[380px] rounded-[0.4rem] border-t-[8px]" : "max-w-[850px]"
      } ${isMinimal ? "border-t-[6px]" : "rounded-[0.4rem] border-t-[10px]"}`}
      style={{ borderColor: receipt.accentColor }}
    >
      <header className={`flex gap-8 border-b border-black/10 pb-8 ${compact ? "flex-col" : "flex-col md:flex-row md:items-start md:justify-between"}`}>
        <div className="max-w-md">
          {receipt.businessLogo && <img src={receipt.businessLogo} alt={`${receipt.businessName || "Business"} logo`} className="mb-5 max-h-20 max-w-40 object-contain" />}
          <h2 className="text-2xl font-black tracking-[-0.04em]">{receipt.businessName || "Business name"}</h2>
          <div className="mt-3 space-y-1 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
            {receipt.businessAddress && <p>{receipt.businessAddress}</p>}
            {receipt.businessEmail && <p>{receipt.businessEmail}</p>}
            {receipt.businessPhone && <p>{receipt.businessPhone}</p>}
            {receipt.businessWebsite && <p>{receipt.businessWebsite}</p>}
            {receipt.businessTaxId && <p>Tax ID: {receipt.businessTaxId}</p>}
            {receipt.businessRegistrationNumber && <p>Registration: {receipt.businessRegistrationNumber}</p>}
            {receipt.businessInfo && <p>{receipt.businessInfo}</p>}
          </div>
        </div>

        <div className={compact ? "text-left" : "text-left md:text-right"}>
          <h1 className="text-5xl font-black tracking-[-0.06em]" style={{ color: receipt.accentColor }}>
            Receipt
          </h1>
          <div className="mt-5 space-y-2 text-sm text-neutral-600">
            <p>
              <span className="text-black">Number:</span> {receipt.receiptNumber || "-"}
            </p>
            <p>
              <span className="text-black">Payment date:</span> {receipt.paymentDate || "-"}
            </p>
            {receipt.paymentTime && (
              <p>
                <span className="text-black">Time:</span> {receipt.paymentTime}
              </p>
            )}
          </div>
          <span className="mt-4 inline-flex rounded-full px-4 py-2 text-xs font-bold" style={{ backgroundColor: receipt.status === "Paid" ? "#e9f8df" : receipt.status === "Voided" ? "#eeeeee" : "#fff4d8", color: "#111111" }}>
            {receipt.status}
          </span>
        </div>
      </header>

      <section className={`grid gap-8 py-8 ${compact ? "" : "md:grid-cols-2"}`}>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: receipt.accentColor }}>
            Received from
          </p>
          <h3 className="text-xl font-black">{customerName}</h3>
          {!receipt.anonymousCustomer && (
            <div className="mt-3 space-y-1 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
              {receipt.contactPerson && <p>Contact: {receipt.contactPerson}</p>}
              {receipt.customerAddress && <p>{receipt.customerAddress}</p>}
              {receipt.customerEmail && <p>{receipt.customerEmail}</p>}
              {receipt.customerPhone && <p>{receipt.customerPhone}</p>}
              {receipt.customerTaxId && <p>Tax ID: {receipt.customerTaxId}</p>}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: receipt.accentColor }}>
            Payment details
          </p>
          <div className="space-y-1 text-sm leading-6 text-neutral-600">
            {paymentLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            {receipt.relatedInvoiceNumber && <p>Invoice: {receipt.relatedInvoiceNumber}</p>}
            {receipt.relatedQuotationNumber && <p>Quotation: {receipt.relatedQuotationNumber}</p>}
            {receipt.reference && <p>Reference: {receipt.reference}</p>}
            {receipt.salesRepresentative && <p>Issued by: {receipt.salesRepresentative}</p>}
            {receipt.branchLocation && <p>Location: {receipt.branchLocation}</p>}
          </div>
        </div>
      </section>

      {receipt.simpleMode ? (
        <section className="rounded-[1.5rem] bg-[#f7f7f4] p-5 text-sm leading-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: receipt.accentColor }}>
            Payment description
          </p>
          <p className="whitespace-pre-wrap">{receipt.paymentDescription || "Payment received"}</p>
        </section>
      ) : (
        <section className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className={isMinimal ? "border-y border-black/15" : "text-white"} style={{ backgroundColor: isMinimal ? "transparent" : receipt.accentColor }}>
                <th className="py-4 pr-4 text-left">Item</th>
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
                      <td className="max-w-[280px] py-4 pr-4">
                        <p className="font-bold">{item.name || "Item"}</p>
                        {item.description && <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-neutral-500">{item.description}</p>}
                        {item.unit && <p className="mt-1 text-xs text-neutral-500">Unit: {item.unit}</p>}
                      </td>
                      <td className="px-3 py-4 text-right">{item.quantity}</td>
                      <td className="px-3 py-4 text-right">{formatMoney(item.unitPrice, receipt.currency)}</td>
                      <td className="px-3 py-4 text-right">{formatMoney(line?.discount || 0, receipt.currency)}</td>
                      <td className="px-3 py-4 text-right">{formatMoney(line?.tax || 0, receipt.currency)}</td>
                      <td className="py-4 pl-3 text-right font-bold">{formatMoney(line?.total || 0, receipt.currency)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    Add paid items to preview them here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      <section className="ml-auto mt-8 w-full max-w-sm space-y-3 text-sm">
        {!receipt.simpleMode && (
          <>
            <PreviewRow label="Subtotal" value={formatMoney(totals.subtotal, receipt.currency)} />
            {totals.lineDiscount > 0 && <PreviewRow label="Line discounts" value={`-${formatMoney(totals.lineDiscount, receipt.currency)}`} />}
            <PreviewRow label="Tax" value={formatMoney(totals.tax, receipt.currency)} />
            {totals.overallDiscount > 0 && <PreviewRow label="Overall discount" value={`-${formatMoney(totals.overallDiscount, receipt.currency)}`} />}
            {totals.shipping > 0 && <PreviewRow label="Shipping" value={formatMoney(totals.shipping, receipt.currency)} />}
            {totals.additionalCharge > 0 && <PreviewRow label="Additional charge" value={formatMoney(totals.additionalCharge, receipt.currency)} />}
          </>
        )}
        <div className="flex justify-between border-t-2 pt-4 text-lg font-black" style={{ borderColor: receipt.accentColor }}>
          <span>Grand total</span>
          <span>{formatMoney(totals.grandTotal, receipt.currency)}</span>
        </div>
        <PreviewRow label="Amount received" value={formatMoney(totals.amountReceived, receipt.currency)} />
        {totals.balanceDue > 0 ? <PreviewRow label="Balance due" value={formatMoney(totals.balanceDue, receipt.currency)} /> : totals.changeDue > 0 ? <PreviewRow label="Change due" value={formatMoney(totals.changeDue, receipt.currency)} /> : <PreviewRow label="Payment status" value="Paid in full" />}
        {receipt.status === "Refunded" && <PreviewRow label="Refunded amount" value={formatMoney(totals.refundedAmount, receipt.currency)} />}
      </section>

      <section className={`mt-10 grid gap-6 text-sm leading-7 ${compact ? "" : "md:grid-cols-2"}`}>
        {noteLines.length > 0 && (
          <div className="break-inside-avoid">
            <h3 className="mb-2 font-black" style={{ color: receipt.accentColor }}>
              Notes
            </h3>
            <div className="space-y-2 whitespace-pre-wrap text-neutral-600">
              {noteLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        )}
        {receipt.showSignature && (
          <div className="break-inside-avoid">
            <h3 className="mb-2 font-black" style={{ color: receipt.accentColor }}>
              Signature
            </h3>
            {receipt.issuedBy && <p className="mb-8 text-neutral-600">Issued by: {receipt.issuedBy}</p>}
            <div className="grid gap-8">
              <div className="border-t border-black pt-3 text-sm text-neutral-600">Authorised signature</div>
              {receipt.showCustomerSignature && <div className="border-t border-black pt-3 text-sm text-neutral-600">Customer signature</div>}
              <div className="border-t border-black pt-3 text-sm text-neutral-600">Date</div>
              {receipt.showBusinessStamp && <div className="rounded-2xl border border-dashed border-black/30 p-5 text-center text-sm text-neutral-500">Business stamp</div>}
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
