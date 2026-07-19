import type { CurrencyCode, DiscountType } from "@/lib/invoice/types";

export type ReceiptStatus = "Paid" | "Partially Paid" | "Refunded" | "Voided";

export type ReceiptTemplate = "modern" | "minimal" | "compact";

export type ReceiptMethod = "Cash" | "Bank Transfer" | "Debit or Credit Card" | "POS" | "Mobile Money" | "Cheque" | "Online Payment" | "Cryptocurrency" | "Other";

export type ReceiptItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
};

export type ReceiptData = {
  simpleMode: boolean;
  anonymousCustomer: boolean;
  businessName: string;
  businessLogo: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  businessWebsite: string;
  businessTaxId: string;
  businessRegistrationNumber: string;
  businessInfo: string;
  customerName: string;
  contactPerson: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerTaxId: string;
  receiptNumber: string;
  paymentDate: string;
  paymentTime: string;
  currency: CurrencyCode;
  status: ReceiptStatus;
  relatedInvoiceNumber: string;
  relatedQuotationNumber: string;
  reference: string;
  transactionId: string;
  salesRepresentative: string;
  branchLocation: string;
  paymentMethod: ReceiptMethod;
  bankName: string;
  accountName: string;
  transactionReference: string;
  cardLastFour: string;
  terminalReference: string;
  cardType: string;
  chequeNumber: string;
  chequeDate: string;
  paymentProvider: string;
  customPaymentMethod: string;
  paymentDescription: string;
  discountType: DiscountType;
  discountValue: number;
  shipping: number;
  additionalCharge: number;
  amountReceived: number;
  refundedAmount: number;
  notes: string;
  thankYouMessage: string;
  acknowledgement: string;
  terms: string;
  refundPolicy: string;
  internalNote: string;
  showInternalNote: boolean;
  showSignature: boolean;
  issuedBy: string;
  showCustomerSignature: boolean;
  showBusinessStamp: boolean;
  template: ReceiptTemplate;
  accentColor: string;
  items: ReceiptItem[];
};

export type ReceiptLineCalculation = {
  id: string;
  gross: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
};

export type ReceiptTotals = {
  lines: ReceiptLineCalculation[];
  subtotalBeforeDiscount: number;
  lineDiscount: number;
  subtotal: number;
  tax: number;
  overallDiscount: number;
  shipping: number;
  additionalCharge: number;
  grandTotal: number;
  amountReceived: number;
  balanceDue: number;
  changeDue: number;
  refundedAmount: number;
};

export type ReceiptValidationErrors = Record<string, string>;
