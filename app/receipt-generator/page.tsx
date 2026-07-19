import type { Metadata } from "next";
import Link from "next/link";
import ReceiptGenerator from "@/components/receipt/ReceiptGenerator";
import AdSenseAd from "@/components/ads/AdSenseAd";
import { ADSENSE_SLOTS } from "@/lib/adsense";

export const metadata: Metadata = {
  title: "Free Receipt Generator | Anulen Technologies",
  description: "Create professional payment receipts online, record payment details, save drafts, print and download receipts as PDF.",
  alternates: {
    canonical: "https://anulen.com/receipt-generator",
  },
  openGraph: {
    title: "Free Receipt Generator | Anulen Technologies",
    description: "Create professional payment receipts online, record payment details, save drafts, print and download receipts as PDF.",
    url: "https://anulen.com/receipt-generator",
    type: "website",
  },
  twitter: {
    title: "Free Receipt Generator | Anulen Technologies",
    description: "Create professional payment receipts online, record payment details, save drafts, print and download receipts as PDF.",
    card: "summary_large_image",
  },
};

const guideSections = [
  {
    title: "What a receipt is",
    body: "A receipt confirms that a payment has been received. It records who paid, who received the money, what the payment covered, and the payment method.",
  },
  {
    title: "What a receipt should contain",
    body: "A clear receipt should include business details, payer details, receipt number, payment date, payment method, amount received, items or payment description, and any relevant reference numbers.",
  },
  {
    title: "Receipt versus invoice",
    body: "An invoice requests payment. A receipt confirms payment after money has been received. You can create a receipt from invoice details when payment is made.",
  },
  {
    title: "Receipt versus payment confirmation",
    body: "A payment confirmation may simply show that a transfer was attempted or completed. A receipt is issued by the seller or business to acknowledge the payment officially.",
  },
  {
    title: "Cash and bank-transfer receipts",
    body: "For cash, record the amount received and any change due. For bank transfers, include a transaction reference, bank name, date and related invoice where available.",
  },
  {
    title: "How data is stored",
    body: "This tool stores draft receipt data locally in your browser. It does not upload receipt content, customer details or logos to Anulen servers.",
  },
];

const faqs = [
  {
    question: "Is the receipt generator free?",
    answer: "Yes. You can create, preview, print and download receipts without creating an account.",
  },
  {
    question: "Is my receipt information uploaded?",
    answer: "No. Receipt data and uploaded logos stay in your browser unless you choose to share the exported PDF yourself.",
  },
  {
    question: "Can I use Nigerian naira?",
    answer: "Yes. Nigerian naira is the default currency, with USD, GBP, EUR, CAD, GHS and ZAR also available.",
  },
  {
    question: "Can I add my business logo?",
    answer: "Yes. PNG, JPG, JPEG and WebP logos are supported up to 2 MB.",
  },
  {
    question: "Can I generate a receipt for a bank transfer?",
    answer: "Yes. Choose Bank Transfer and add the bank name, account name and transaction reference where available.",
  },
  {
    question: "Can I create a receipt without itemising products?",
    answer: "Yes. Enable Simple receipt mode and enter a payment description and amount received.",
  },
  {
    question: "Can I download it as PDF?",
    answer: "Yes. Fill the required fields and use the Download PDF button.",
  },
  {
    question: "Can I create a receipt from an invoice?",
    answer: "Yes. The invoice generator includes a receipt action that maps compatible invoice details into a receipt draft.",
  },
];

export default function ReceiptGeneratorPage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <ReceiptGenerator />

      <section className="receipt-no-print px-6 pb-24 pt-10 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <p className="mb-4 text-sm font-bold text-[#589037]">Receipt guide</p>
              <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">Confirm payments with clearer records.</h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-300">
                Use this generator after a customer pays, or start from the related{" "}
                <Link href="/invoice-generator" className="font-bold text-[#589037]">
                  invoice generator
                </Link>{" "}
                when a payment is tied to an invoice.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {guideSections.map((section) => (
                <article key={section.title} className="rounded-[1.5rem] bg-[#f7f7f4] p-6 dark:bg-white/10">
                  <h3 className="text-lg font-black tracking-[-0.03em]">{section.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-500 dark:text-neutral-300">{section.body}</p>
                </article>
              ))}
            </div>
          </div>

          <AdSenseAd slot={ADSENSE_SLOTS.bottom} className="px-0 md:px-0 lg:px-0" />

          <div className="mt-20">
            <p className="mb-4 text-sm font-bold text-[#589037]">FAQ</p>
            <h2 className="text-4xl font-black tracking-[-0.05em] md:text-5xl">Frequently asked questions</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-[1.5rem] bg-[#f7f7f4] p-6 dark:bg-white/10">
                  <summary className="cursor-pointer list-none text-base font-black">
                    {faq.question}
                    <span className="float-right text-[#589037] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-neutral-500 dark:text-neutral-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
