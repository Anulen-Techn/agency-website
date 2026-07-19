export type Tool = {
  title: string;
  href: string;
  eyebrow: string;
  description: string;
  status: string;
};

export const tools: Tool[] = [
  {
    title: "Background Remover",
    href: "/background-remover",
    eyebrow: "Free image tool",
    description:
      "Remove plain image backgrounds, preserve internal details, replace backgrounds, and download transparent PNG files in your browser.",
    status: "Available now",
  },
  {
    title: "Image Compressor",
    href: "/image-compressor",
    eyebrow: "Free image tool",
    description:
      "Compress images, resize photos, strip metadata, and download optimised JPG, PNG or WebP files in your browser.",
    status: "Available now",
  },
  {
    title: "Profit Calculator",
    href: "/profit-calculator",
    eyebrow: "Free finance tool",
    description:
      "Calculate profit, margin, markup, ROI, target selling price, break-even quantity, and compare pricing scenarios in your browser.",
    status: "Available now",
  },
  {
    title: "QR Code Generator",
    href: "/qr-code-generator",
    eyebrow: "Free utility tool",
    description:
      "Create custom QR codes for websites, Wi-Fi, WhatsApp, email, contact cards, locations, events, payments, and more.",
    status: "Available now",
  },
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
