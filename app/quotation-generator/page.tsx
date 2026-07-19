import type { Metadata } from "next";
import Link from "next/link";
import QuotationGenerator from "@/components/quotation/QuotationGenerator";

export const metadata: Metadata = {
  title: "Free Quotation Generator | Anulen Technologies",
  description: "Create professional quotations online, calculate totals automatically, save drafts, print and download quotations as PDF.",
  alternates: {
    canonical: "https://anulen.com/quotation-generator",
  },
  openGraph: {
    title: "Free Quotation Generator | Anulen Technologies",
    description: "Create professional quotations online, calculate totals automatically, save drafts, print and download quotations as PDF.",
    url: "https://anulen.com/quotation-generator",
    type: "website",
  },
  twitter: {
    title: "Free Quotation Generator | Anulen Technologies",
    description: "Create professional quotations online, calculate totals automatically, save drafts, print and download quotations as PDF.",
    card: "summary_large_image",
  },
};

const guideSections = [
  {
    title: "What a quotation is",
    body: "A quotation is a formal offer that explains what you will provide, how much it will cost, and how long the offer remains valid. It helps customers approve work before an invoice is created.",
  },
  {
    title: "How to create a quotation",
    body: "Add your business details, customer details, products or services, taxes, discounts, payment terms, validity dates and any acceptance instructions. The preview updates as you edit.",
  },
  {
    title: "Quotation versus invoice",
    body: "A quotation is sent before work is approved. An invoice is sent after approval or delivery to request payment. This tool can convert compatible quotation details into the invoice generator.",
  },
  {
    title: "Quotation versus estimate",
    body: "A quotation is usually more fixed, while an estimate is a rough projection that may change. Keep the validity period and terms clear so customers understand what they are accepting.",
  },
  {
    title: "How long a quotation should remain valid",
    body: "Many businesses use 14 to 30 days, depending on supplier prices, currency changes and project scope. This generator defaults to 14 days, and you can edit the date.",
  },
  {
    title: "How data is stored",
    body: "Your quotation draft is stored locally in your browser. The tool does not upload quotation content or logo files to Anulen servers.",
  },
];

const faqs = [
  {
    question: "Is the quotation generator free?",
    answer: "Yes. You can create, preview, print and download quotations without creating an account.",
  },
  {
    question: "Is my information uploaded to a server?",
    answer: "No. The quotation data and uploaded logo are processed in your browser and saved locally as a browser draft.",
  },
  {
    question: "Can I download the quotation as PDF?",
    answer: "Yes. Use the Download PDF button after filling the required fields.",
  },
  {
    question: "Can I add my business logo?",
    answer: "Yes. PNG, JPG, JPEG and WebP logos are supported up to 2 MB.",
  },
  {
    question: "Can I use Nigerian naira?",
    answer: "Yes. Nigerian naira is the default currency, and USD, GBP, EUR, CAD, GHS and ZAR are also available.",
  },
  {
    question: "What is the difference between a quotation and an invoice?",
    answer: "A quotation is an offer before approval. An invoice is a payment request after approval, delivery or a payment milestone.",
  },
  {
    question: "Can I convert a quotation into an invoice?",
    answer: "Yes. The conversion action maps compatible quotation fields into the existing invoice generator draft.",
  },
  {
    question: "Can I save my quotation and return later?",
    answer: "Yes. Drafts are saved in localStorage on the same browser and device.",
  },
];

export default function QuotationGeneratorPage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <QuotationGenerator />

      <section className="quotation-no-print px-6 pb-24 pt-10 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <p className="mb-4 text-sm font-bold text-[#589037]">Quotation guide</p>
              <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">Create clearer quotes before work begins.</h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-300">
                Use this generator to prepare a professional quotation, then turn accepted work into an invoice with the related{" "}
                <Link href="/invoice-generator" className="font-bold text-[#589037]">
                  invoice generator
                </Link>{" "}
                or issue a{" "}
                <Link href="/receipt-generator" className="font-bold text-[#589037]">
                  receipt
                </Link>{" "}
                after payment is received.
                .
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
