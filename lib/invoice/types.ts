export type CurrencyCode = "NGN" | "USD" | "GBP" | "EUR" | "CAD" | "GHS" | "ZAR";

export type PaymentStatus = "Draft" | "Unpaid" | "Paid";

export type DiscountType = "percentage" | "fixed";

export type InvoiceTemplate = "modern" | "minimal";

export type AccentColor = {
  name: string;
  value: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  details: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export type InvoiceData = {
  businessName: string;
  businessLogo: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  businessWebsite: string;
  businessTaxId: string;
  businessInfo: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientTaxId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  reference: string;
  status: PaymentStatus;
  currency: CurrencyCode;
  discountType: DiscountType;
  discountValue: number;
  shipping: number;
  amountPaid: number;
  notes: string;
  terms: string;
  paymentInstructions: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentLink: string;
  template: InvoiceTemplate;
  accentColor: string;
  items: InvoiceItem[];
};

export type LineCalculation = {
  id: string;
  subtotal: number;
  tax: number;
  total: number;
};

export type InvoiceTotals = {
  lines: LineCalculation[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
};

export type ValidationErrors = Record<string, string>;
