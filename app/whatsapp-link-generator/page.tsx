import type { Metadata } from "next";
import Link from "next/link";
import WhatsAppLinkGenerator from "@/components/whatsapp/WhatsAppLinkGenerator";
import AdSenseAd from "@/components/ads/AdSenseAd";
import { ADSENSE_SLOTS } from "@/lib/adsense";

export const metadata: Metadata = {
  title: "Free WhatsApp Link Generator | Anulen Technologies",
  description: "Create a direct WhatsApp chat link with a custom pre-filled message. Copy your link, generate a QR code and add a WhatsApp button to your website.",
  alternates: {
    canonical: "https://anulen.com/whatsapp-link-generator",
  },
  openGraph: {
    title: "Free WhatsApp Link Generator | Anulen Technologies",
    description: "Create a direct WhatsApp chat link with a custom pre-filled message. Copy your link, generate a QR code and add a WhatsApp button to your website.",
    url: "https://anulen.com/whatsapp-link-generator",
    type: "website",
  },
  twitter: {
    title: "Free WhatsApp Link Generator | Anulen Technologies",
    description: "Create a direct WhatsApp chat link with a custom pre-filled message. Copy your link, generate a QR code and add a WhatsApp button to your website.",
    card: "summary_large_image",
  },
};

const guideSections = [
  {
    title: "What a WhatsApp link is",
    body: "A WhatsApp link is a click-to-chat URL that opens a conversation with a phone number. It can also include a pre-filled message for the visitor to send.",
  },
  {
    title: "How click-to-chat works",
    body: "The official format is wa.me followed by the international phone number without a plus sign, spaces, brackets or local leading zero.",
  },
  {
    title: "How to add a message",
    body: "Write your message in the textarea. The tool encodes line breaks, emojis, ampersands, hashtags, punctuation and currency symbols safely for the URL.",
  },
  {
    title: "Using links on social media",
    body: "You can place the generated link in Instagram bios, Facebook pages, ads, posts, business profiles, email signatures and website buttons.",
  },
  {
    title: "Creating a QR code",
    body: "A QR code lets people scan from posters, packaging, receipts, business cards or storefront signs and open the WhatsApp chat directly.",
  },
  {
    title: "Privacy",
    body: "Phone numbers, messages, QR codes and recent history stay in your browser. The tool does not send them to Anulen servers or external QR APIs.",
  },
];

const faqs = [
  {
    question: "Is the WhatsApp link generator free?",
    answer: "Yes. You can generate, copy, share and download QR codes without creating an account.",
  },
  {
    question: "Do I need a WhatsApp Business account?",
    answer: "No. The link format works with normal WhatsApp and WhatsApp Business numbers.",
  },
  {
    question: "Do I need the WhatsApp API?",
    answer: "No. This tool creates official click-to-chat links and does not use the WhatsApp Cloud API.",
  },
  {
    question: "How should I enter my phone number?",
    answer: "You can enter local or international formats. The tool removes spaces, brackets, dashes, plus signs and local leading zeroes.",
  },
  {
    question: "Can I add a pre-filled message?",
    answer: "Yes. Messages are optional and are encoded safely, including emojis, punctuation and line breaks.",
  },
  {
    question: "Can I generate a QR code?",
    answer: "Yes. The QR code is generated in your browser and can be downloaded as a PNG.",
  },
  {
    question: "Is my phone number uploaded anywhere?",
    answer: "No. Generated links and recent history stay in localStorage in your browser.",
  },
  {
    question: "Can the tool check whether a number is registered on WhatsApp?",
    answer: "No. It formats the link but cannot verify whether the phone number is active on WhatsApp.",
  },
];

const relatedTools = [
  { label: "Invoice Generator", href: "/invoice-generator" },
  { label: "Quotation Generator", href: "/quotation-generator" },
  { label: "Receipt Generator", href: "/receipt-generator" },
];

export default function WhatsAppLinkGeneratorPage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <WhatsAppLinkGenerator />

      <section className="whatsapp-no-print px-6 pb-24 pt-10 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <p className="mb-4 text-sm font-bold text-[#589037]">WhatsApp guide</p>
              <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">Make it easier for customers to start a chat.</h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-300">
                Create a clean WhatsApp link for profiles, websites, invoices, receipts, product pages and campaigns. This tool is independent and is
                not affiliated with WhatsApp or Meta.
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
