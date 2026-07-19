import { calculateQuotationTotals } from "@/lib/quotation/calculations";
import type { QuotationData, QuotationValidationErrors } from "@/lib/quotation/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidUrl(value: string) {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateQuotation(quotation: QuotationData): QuotationValidationErrors {
  const errors: QuotationValidationErrors = {};
  const totals = calculateQuotationTotals(quotation);

  if (!quotation.businessName.trim()) errors.businessName = "Business name is required.";
  if (!quotation.customerName.trim()) errors.customerName = "Customer name is required.";
  if (!quotation.quotationNumber.trim()) errors.quotationNumber = "Quotation number is required.";
  if (!quotation.issueDate) errors.issueDate = "Issue date is required.";
  if (!quotation.validUntil) errors.validUntil = "Valid-until date is required.";

  if (quotation.businessEmail && !emailPattern.test(quotation.businessEmail)) errors.businessEmail = "Enter a valid business email.";
  if (quotation.customerEmail && !emailPattern.test(quotation.customerEmail)) errors.customerEmail = "Enter a valid customer email.";
  if (quotation.businessWebsite && !isValidUrl(quotation.businessWebsite)) errors.businessWebsite = "Enter a valid website URL.";
  if (quotation.paymentLink && !isValidUrl(quotation.paymentLink)) errors.paymentLink = "Enter a valid payment link.";

  if (quotation.issueDate && quotation.validUntil && quotation.validUntil < quotation.issueDate) {
    errors.validUntil = "Valid-until date cannot be earlier than the issue date.";
  }

  if (quotation.discountValue < 0) errors.discountValue = "Overall discount cannot be negative.";
  if (quotation.discountType === "percentage" && quotation.discountValue > 100) errors.discountValue = "Percentage discount cannot exceed 100%.";
  if (quotation.shipping < 0) errors.shipping = "Shipping or delivery charge cannot be negative.";
  if (quotation.additionalCharge < 0) errors.additionalCharge = "Additional charge cannot be negative.";
  if (quotation.depositValue < 0) errors.depositValue = "Deposit cannot be negative.";
  if (quotation.depositType === "percentage" && quotation.depositValue > 100) errors.depositValue = "Deposit percentage cannot exceed 100%.";
  if (quotation.depositType === "fixed" && quotation.depositValue > totals.grandTotal) errors.depositValue = "Deposit cannot be greater than the grand total.";

  const meaningfulItems = quotation.items.filter((item) => item.name.trim() || item.description.trim() || item.unitPrice > 0);

  if (!meaningfulItems.length) {
    errors.items = "Add at least one meaningful quotation item.";
  }

  quotation.items.forEach((item, index) => {
    if (item.quantity <= 0) errors[`items.${item.id}.quantity`] = `Item ${index + 1}: quantity must be greater than zero.`;
    if (item.unitPrice < 0) errors[`items.${item.id}.unitPrice`] = `Item ${index + 1}: unit price cannot be negative.`;
    if (item.discountValue < 0) errors[`items.${item.id}.discountValue`] = `Item ${index + 1}: discount cannot be negative.`;
    if (item.discountType === "percentage" && item.discountValue > 100) errors[`items.${item.id}.discountValue`] = `Item ${index + 1}: percentage discount cannot exceed 100%.`;
    if (item.taxRate < 0 || item.taxRate > 100) errors[`items.${item.id}.taxRate`] = `Item ${index + 1}: tax must be between 0 and 100%.`;
  });

  return errors;
}
