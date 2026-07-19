import type { CurrencyCode, DiscountType } from "@/lib/invoice/types";

export type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Declined" | "Expired";

export type QuotationTemplate = "modern" | "minimal";

export type DepositType = "percentage" | "fixed";

export type QuotationItem = {
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

export type QuotationData = {
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
  quotationNumber: string;
  issueDate: string;
  validUntil: string;
  reference: string;
  salesRepresentative: string;
  projectName: string;
  status: QuotationStatus;
  currency: CurrencyCode;
  discountType: DiscountType;
  discountValue: number;
  shipping: number;
  additionalCharge: number;
  depositType: DepositType;
  depositValue: number;
  introductoryMessage: string;
  notes: string;
  terms: string;
  deliveryTimeline: string;
  estimatedCompletionTime: string;
  warrantyInformation: string;
  paymentTerms: string;
  bankDetails: string;
  paymentLink: string;
  acceptanceInstructions: string;
  showAcceptance: boolean;
  template: QuotationTemplate;
  accentColor: string;
  items: QuotationItem[];
};

export type QuotationLineCalculation = {
  id: string;
  gross: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
};

export type QuotationTotals = {
  lines: QuotationLineCalculation[];
  subtotalBeforeDiscount: number;
  lineDiscount: number;
  subtotal: number;
  tax: number;
  overallDiscount: number;
  shipping: number;
  additionalCharge: number;
  grandTotal: number;
  depositRequired: number;
  balanceAfterDeposit: number;
};

export type QuotationValidationErrors = Record<string, string>;
