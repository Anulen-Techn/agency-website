import type { ReceiptData, ReceiptValidationErrors } from "@/lib/receipt/types";

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

export function validateReceipt(receipt: ReceiptData): ReceiptValidationErrors {
  const errors: ReceiptValidationErrors = {};

  if (!receipt.businessName.trim()) errors.businessName = "Business name is required.";
  if (!receipt.receiptNumber.trim()) errors.receiptNumber = "Receipt number is required.";
  if (!receipt.paymentDate) errors.paymentDate = "Payment date is required.";
  if (!receipt.anonymousCustomer && !receipt.customerName.trim()) errors.customerName = "Customer name is required unless anonymous mode is enabled.";

  if (receipt.businessEmail && !emailPattern.test(receipt.businessEmail)) errors.businessEmail = "Enter a valid business email.";
  if (receipt.customerEmail && !emailPattern.test(receipt.customerEmail)) errors.customerEmail = "Enter a valid customer email.";
  if (receipt.businessWebsite && !isValidUrl(receipt.businessWebsite)) errors.businessWebsite = "Enter a valid website URL.";

  if (receipt.amountReceived < 0) errors.amountReceived = "Amount received cannot be negative.";
  if (receipt.refundedAmount < 0) errors.refundedAmount = "Refunded amount cannot be negative.";
  if (receipt.discountValue < 0) errors.discountValue = "Overall discount cannot be negative.";
  if (receipt.discountType === "percentage" && receipt.discountValue > 100) errors.discountValue = "Percentage discount cannot exceed 100%.";
  if (receipt.shipping < 0) errors.shipping = "Shipping or delivery charge cannot be negative.";
  if (receipt.additionalCharge < 0) errors.additionalCharge = "Additional charge cannot be negative.";

  if (receipt.simpleMode) {
    if (!receipt.paymentDescription.trim()) errors.paymentDescription = "Payment description is required in simple receipt mode.";
    if (receipt.amountReceived <= 0) errors.amountReceived = "Enter the amount received.";
  } else {
    const meaningfulItems = receipt.items.filter((item) => item.name.trim() || item.description.trim() || item.unitPrice > 0);

    if (!meaningfulItems.length) {
      errors.items = "Add at least one meaningful receipt item.";
    }

    receipt.items.forEach((item, index) => {
      if (item.quantity <= 0) errors[`items.${item.id}.quantity`] = `Item ${index + 1}: quantity must be greater than zero.`;
      if (item.unitPrice < 0) errors[`items.${item.id}.unitPrice`] = `Item ${index + 1}: unit price cannot be negative.`;
      if (item.discountValue < 0) errors[`items.${item.id}.discountValue`] = `Item ${index + 1}: discount cannot be negative.`;
      if (item.discountType === "percentage" && item.discountValue > 100) errors[`items.${item.id}.discountValue`] = `Item ${index + 1}: percentage discount cannot exceed 100%.`;
      if (item.taxRate < 0 || item.taxRate > 100) errors[`items.${item.id}.taxRate`] = `Item ${index + 1}: tax must be between 0 and 100%.`;
    });
  }

  if (receipt.paymentMethod === "Cheque" && receipt.chequeDate && receipt.chequeDate < receipt.paymentDate) {
    errors.chequeDate = "Cheque date should not be earlier than the payment date.";
  }

  return errors;
}
