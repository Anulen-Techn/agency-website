import { calculateInvoiceTotals } from "@/lib/invoice/calculations";
import type { InvoiceData } from "@/lib/invoice/types";
import { generateReceiptNumber } from "@/lib/receipt/receiptNumber";
import type { ReceiptData, ReceiptItem } from "@/lib/receipt/types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function receiptItemFromInvoice(item: InvoiceData["items"][number]): ReceiptItem {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name: item.description,
    description: item.details,
    quantity: item.quantity,
    unit: "Item",
    unitPrice: item.unitPrice,
    discountType: "percentage",
    discountValue: 0,
    taxRate: item.taxRate,
  };
}

export function invoiceToReceiptDraft(invoice: InvoiceData, amountReceived?: number): ReceiptData {
  const totals = calculateInvoiceTotals(invoice);
  const received = amountReceived ?? (totals.amountPaid > 0 ? totals.amountPaid : totals.grandTotal);
  const items = invoice.items.filter((item) => item.description.trim() || item.details.trim() || item.unitPrice > 0).map(receiptItemFromInvoice);

  return {
    simpleMode: false,
    anonymousCustomer: false,
    businessName: invoice.businessName,
    businessLogo: invoice.businessLogo,
    businessAddress: invoice.businessAddress,
    businessEmail: invoice.businessEmail,
    businessPhone: invoice.businessPhone,
    businessWebsite: invoice.businessWebsite,
    businessTaxId: invoice.businessTaxId,
    businessRegistrationNumber: "",
    businessInfo: invoice.businessInfo,
    customerName: invoice.clientName,
    contactPerson: "",
    customerEmail: invoice.clientEmail,
    customerPhone: invoice.clientPhone,
    customerAddress: invoice.clientAddress,
    customerTaxId: invoice.clientTaxId,
    receiptNumber: generateReceiptNumber(),
    paymentDate: today(),
    paymentTime: nowTime(),
    currency: invoice.currency,
    status: received >= totals.grandTotal ? "Paid" : "Partially Paid",
    relatedInvoiceNumber: invoice.invoiceNumber,
    relatedQuotationNumber: "",
    reference: invoice.reference,
    transactionId: "",
    salesRepresentative: "",
    branchLocation: "",
    paymentMethod: "Bank Transfer",
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
    paymentDescription: `Payment received for invoice ${invoice.invoiceNumber}`,
    discountType: invoice.discountType,
    discountValue: invoice.discountValue,
    shipping: invoice.shipping,
    additionalCharge: 0,
    amountReceived: received,
    refundedAmount: 0,
    notes: invoice.notes,
    thankYouMessage: "Thank you for your payment.",
    acknowledgement: "This receipt confirms that the payment shown above has been received.",
    terms: invoice.terms,
    refundPolicy: "",
    internalNote: "",
    showInternalNote: false,
    showSignature: true,
    issuedBy: "",
    showCustomerSignature: false,
    showBusinessStamp: false,
    template: invoice.template === "minimal" ? "minimal" : "modern",
    accentColor: invoice.accentColor,
    items: items.length ? items : [receiptItemFromInvoice(invoice.items[0])],
  };
}
