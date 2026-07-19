import type { Metadata } from "next";
import InvoiceGenerator from "@/components/invoice/InvoiceGenerator";

export const metadata: Metadata = {
  title: "Free Invoice Generator | Anulen Technologies",
  description: "Create professional invoices online, calculate totals automatically, save drafts, print invoices and download them as PDF.",
  openGraph: {
    title: "Free Invoice Generator | Anulen Technologies",
    description: "Create professional invoices online, calculate totals automatically, save drafts, print invoices and download them as PDF.",
    type: "website",
  },
  twitter: {
    title: "Free Invoice Generator | Anulen Technologies",
    description: "Create professional invoices online, calculate totals automatically, save drafts, print invoices and download them as PDF.",
    card: "summary_large_image",
  },
};

export default function InvoiceGeneratorPage() {
  return <InvoiceGenerator />;
}
