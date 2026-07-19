import { generateInvoiceNumber } from "@/lib/invoice/invoiceNumber";
import type { InvoiceData, InvoiceItem } from "@/lib/invoice/types";
import type { QuotationData } from "@/lib/quotation/types";

function invoiceItemFromQuotation(item: QuotationData["items"][number]): InvoiceItem {
  const detailParts = [
    item.description,
    item.unit && `Unit: ${item.unit}`,
    item.discountValue > 0 && `Quoted line discount: ${item.discountValue}${item.discountType === "percentage" ? "%" : ""}`,
  ].filter(Boolean);

  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    description: item.name,
    details: detailParts.join("\n"),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxRate: item.taxRate,
  };
}

export function quotationToInvoiceDraft(quotation: QuotationData): InvoiceData {
  const today = new Date().toISOString().slice(0, 10);
  const items = quotation.items.filter((item) => item.name.trim() || item.description.trim() || item.unitPrice > 0).map(invoiceItemFromQuotation);

  return {
    businessName: quotation.businessName,
    businessLogo: quotation.businessLogo,
    businessAddress: quotation.businessAddress,
    businessEmail: quotation.businessEmail,
    businessPhone: quotation.businessPhone,
    businessWebsite: quotation.businessWebsite,
    businessTaxId: quotation.businessTaxId,
    businessInfo: [quotation.businessRegistrationNumber && `Registration number: ${quotation.businessRegistrationNumber}`, quotation.businessInfo]
      .filter(Boolean)
      .join("\n"),
    clientName: quotation.customerName,
    clientEmail: quotation.customerEmail,
    clientPhone: quotation.customerPhone,
    clientAddress: quotation.customerAddress,
    clientTaxId: quotation.customerTaxId,
    invoiceNumber: generateInvoiceNumber(),
    issueDate: today,
    dueDate: quotation.validUntil || today,
    reference: quotation.quotationNumber,
    status: "Draft",
    currency: quotation.currency,
    discountType: quotation.discountType,
    discountValue: quotation.discountValue,
    shipping: quotation.shipping + quotation.additionalCharge,
    amountPaid: 0,
    notes: [quotation.introductoryMessage, quotation.notes, quotation.deliveryTimeline && `Delivery timeline: ${quotation.deliveryTimeline}`]
      .filter(Boolean)
      .join("\n\n"),
    terms: [
      quotation.terms,
      quotation.paymentTerms && `Payment terms: ${quotation.paymentTerms}`,
      quotation.depositValue > 0 && `Deposit requirement from quotation: ${quotation.depositValue}${quotation.depositType === "percentage" ? "%" : ""}`,
      quotation.acceptanceInstructions && `Acceptance: ${quotation.acceptanceInstructions}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    paymentInstructions: quotation.bankDetails,
    bankName: "",
    accountName: "",
    accountNumber: "",
    paymentLink: quotation.paymentLink,
    template: quotation.template,
    accentColor: quotation.accentColor,
    items: items.length ? items : [invoiceItemFromQuotation(quotation.items[0])],
  };
}
