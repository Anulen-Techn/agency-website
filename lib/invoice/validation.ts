import type { InvoiceData, ValidationErrors } from "@/lib/invoice/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInvoice(invoice: InvoiceData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!invoice.businessName.trim()) errors.businessName = "Business name is required.";
  if (!invoice.clientName.trim()) errors.clientName = "Client name is required.";
  if (!invoice.invoiceNumber.trim()) errors.invoiceNumber = "Invoice number is required.";

  if (invoice.businessEmail && !emailPattern.test(invoice.businessEmail)) errors.businessEmail = "Enter a valid business email.";
  if (invoice.clientEmail && !emailPattern.test(invoice.clientEmail)) errors.clientEmail = "Enter a valid client email.";

  if (invoice.issueDate && invoice.dueDate && invoice.dueDate < invoice.issueDate) {
    errors.dueDate = "Due date cannot be earlier than the issue date.";
  }

  if (invoice.discountValue < 0) errors.discountValue = "Discount cannot be negative.";
  if (invoice.discountType === "percentage" && invoice.discountValue > 100) errors.discountValue = "Percentage discount cannot exceed 100%.";
  if (invoice.shipping < 0) errors.shipping = "Additional charges cannot be negative.";
  if (invoice.amountPaid < 0) errors.amountPaid = "Amount paid cannot be negative.";

  const meaningfulItems = invoice.items.filter((item) => item.description.trim() || item.unitPrice > 0 || item.quantity > 0);

  if (!meaningfulItems.length) {
    errors.items = "Add at least one meaningful invoice item.";
  }

  invoice.items.forEach((item, index) => {
    if (item.quantity <= 0) errors[`items.${item.id}.quantity`] = `Item ${index + 1}: quantity must be greater than zero.`;
    if (item.unitPrice < 0) errors[`items.${item.id}.unitPrice`] = `Item ${index + 1}: unit price cannot be negative.`;
    if (item.taxRate < 0 || item.taxRate > 100) errors[`items.${item.id}.taxRate`] = `Item ${index + 1}: tax must be between 0 and 100%.`;
  });

  return errors;
}
