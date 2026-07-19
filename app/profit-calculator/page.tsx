import type { Metadata } from "next";
import Link from "next/link";
import ProfitCalculator from "@/components/profit/ProfitCalculator";
import AdSenseAd from "@/components/ads/AdSenseAd";
import { ADSENSE_SLOTS } from "@/lib/adsense";

export const metadata: Metadata = {
  title: "Free Profit Calculator | Anulen Technologies",
  description: "Calculate profit, profit margin, markup, ROI, target selling price and break-even quantity for your business.",
  alternates: {
    canonical: "https://anulen.com/profit-calculator",
  },
  openGraph: {
    title: "Free Profit Calculator | Anulen Technologies",
    description: "Calculate profit, profit margin, markup, ROI, target selling price and break-even quantity for your business.",
    url: "https://anulen.com/profit-calculator",
    type: "website",
  },
  twitter: {
    title: "Free Profit Calculator | Anulen Technologies",
    description: "Calculate profit, profit margin, markup, ROI, target selling price and break-even quantity for your business.",
    card: "summary_large_image",
  },
};

const guideSections = [
  {
    title: "What profit means",
    body: "Profit is what remains after subtracting costs and expenses from revenue. It helps you understand whether a sale, product or campaign is actually making money.",
  },
  {
    title: "Gross profit versus net profit",
    body: "Gross profit subtracts product cost from revenue. Net profit goes further by including expenses such as delivery, ads, tax, processing fees and other operating costs.",
  },
  {
    title: "Profit margin versus markup",
    body: "Profit margin compares profit to selling price. Markup compares profit to cost. They are related, but they are not the same percentage.",
  },
  {
    title: "How to calculate selling price",
    body: "To target a margin, estimate your total cost per item and divide it by one minus the desired margin. The target price mode does this for you.",
  },
  {
    title: "Break-even quantity",
    body: "Break-even quantity estimates how many units you need to sell before revenue covers fixed costs and per-item costs.",
  },
  {
    title: "Limitations",
    body: "This calculator provides estimates. It is not accounting, tax or financial advice, and it does not replace proper bookkeeping.",
  },
];

const faqs = [
  { question: "Is the profit calculator free?", answer: "Yes. You can calculate, save and compare scenarios without creating an account." },
  { question: "What is the difference between profit and revenue?", answer: "Revenue is money earned from sales. Profit is what remains after costs and expenses." },
  { question: "What is profit margin?", answer: "Profit margin is net profit divided by net revenue, shown as a percentage." },
  { question: "What is markup?", answer: "Markup is profit per item divided by cost per item, shown as a percentage." },
  { question: "Why are markup and profit margin different?", answer: "They use different bases. Margin uses selling price or revenue, while markup uses cost." },
  { question: "How do I calculate break-even quantity?", answer: "Divide fixed costs by contribution margin per item." },
  { question: "Can I use Nigerian naira?", answer: "Yes. NGN is the default, with USD, GBP, EUR, CAD, GHS and ZAR also available." },
  { question: "Are my calculations uploaded?", answer: "No. Calculations and saved scenarios stay in localStorage in your browser." },
  { question: "Does the calculator include tax?", answer: "Yes. The advanced mode includes a tax field and other expense inputs." },
];

const relatedTools = [
  { label: "Invoice Generator", href: "/invoice-generator" },
  { label: "Quotation Generator", href: "/quotation-generator" },
  { label: "Receipt Generator", href: "/receipt-generator" },
  { label: "QR Code Generator", href: "/qr-code-generator" },
  { label: "WhatsApp Link Generator", href: "/whatsapp-link-generator" },
];

export default function ProfitCalculatorPage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <ProfitCalculator />

      <section className="profit-no-print px-6 pb-24 pt-10 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <p className="mb-4 text-sm font-bold text-[#589037]">Profit guide</p>
              <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">Price with clearer numbers.</h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-300">
                Use this calculator before creating a{" "}
                <Link href="/quotation-generator" className="font-bold text-[#589037]">
                  quotation
                </Link>{" "}
                or{" "}
                <Link href="/invoice-generator" className="font-bold text-[#589037]">
                  invoice
                </Link>
                . It helps Nigerian small businesses and global sellers estimate profit before making pricing decisions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {relatedTools.map((tool) => (
                  <Link key={tool.href} href={tool.href} className="rounded-full border border-black px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
                    {tool.label}
                  </Link>
                ))}
              </div>
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
