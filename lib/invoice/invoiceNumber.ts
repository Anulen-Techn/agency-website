export function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(Math.random() * 9000) + 1).padStart(4, "0");

  return `INV-${year}-${suffix}`;
}
