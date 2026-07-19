export function generateQuotationNumber() {
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(Math.random() * 9000) + 1).padStart(4, "0");

  return `QUO-${year}-${suffix}`;
}
