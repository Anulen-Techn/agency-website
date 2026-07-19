export type Tool = {
  title: string;
  href: string;
  eyebrow: string;
  description: string;
  status: string;
};

export const tools: Tool[] = [
  {
    title: "WhatsApp Link Generator",
    href: "/whatsapp-link-generator",
    eyebrow: "Free marketing tool",
    description:
      "Create direct WhatsApp click-to-chat links with pre-filled messages, QR codes, copyable formats, website button code, and browser-only history.",
    status: "Available now",
  },
  {
    title: "Receipt Generator",
    href: "/receipt-generator",
    eyebrow: "Free business tool",
    description:
      "Create payment receipts in your browser, track payment methods, calculate balances or change, save drafts, print, and download PDFs.",
    status: "Available now",
  },
  {
    title: "Quotation Generator",
    href: "/quotation-generator",
    eyebrow: "Free business tool",
    description:
      "Create client-ready quotations, calculate products and services, save browser drafts, print, download PDFs, and convert accepted quotes into invoices.",
    status: "Available now",
  },
  {
    title: "Invoice Generator",
    href: "/invoice-generator",
    eyebrow: "Free business tool",
    description:
      "Create polished invoices in your browser, calculate totals automatically, save drafts, print invoices, and download professional PDFs.",
    status: "Available now",
  },
];
