import type { Metadata } from "next";
import Link from "next/link";
import QrCodeGenerator from "@/components/qr/QrCodeGenerator";

export const metadata: Metadata = {
  title: "Free QR Code Generator | Anulen Technologies",
  description: "Create custom QR codes for websites, Wi-Fi, WhatsApp, email, contact cards, text and more. Customise and download your QR code as PNG or SVG.",
  alternates: {
    canonical: "https://anulen.com/qr-code-generator",
  },
  openGraph: {
    title: "Free QR Code Generator | Anulen Technologies",
    description: "Create custom QR codes for websites, Wi-Fi, WhatsApp, email, contact cards, text and more. Customise and download your QR code as PNG or SVG.",
    url: "https://anulen.com/qr-code-generator",
    type: "website",
  },
  twitter: {
    title: "Free QR Code Generator | Anulen Technologies",
    description: "Create custom QR codes for websites, Wi-Fi, WhatsApp, email, contact cards, text and more. Customise and download your QR code as PNG or SVG.",
    card: "summary_large_image",
  },
};

const guideSections = [
  {
    title: "What QR codes are",
    body: "A QR code stores text or a destination that phones can scan quickly. It can open a website, join Wi-Fi, start a WhatsApp chat, create an email, save a contact or show custom text.",
  },
  {
    title: "How static QR codes work",
    body: "Static QR codes contain the final destination directly. Once downloaded and printed, the destination cannot be changed without creating a new QR code.",
  },
  {
    title: "Website, Wi-Fi and WhatsApp QR codes",
    body: "Use website QR codes for landing pages, Wi-Fi QR codes for guest access, and WhatsApp QR codes to let people start a chat without typing your number.",
  },
  {
    title: "Print size and quiet zones",
    body: "Keep enough white space around the code and avoid printing too small. For flyers and cards, test the final printed size before distributing it.",
  },
  {
    title: "Contrast and error correction",
    body: "Strong contrast helps scanners read the code. Higher error correction can help when a logo is added, but every branded QR code should still be tested.",
  },
  {
    title: "Privacy",
    body: "QR content and uploaded logos are processed in your browser. The tool does not upload your QR data or images to Anulen servers or external QR APIs.",
  },
];

const faqs = [
  {
    question: "Is the QR code generator free?",
    answer: "Yes. You can create, customise and download QR codes without creating an account.",
  },
  {
    question: "Do QR codes expire?",
    answer: "Static QR codes do not expire by themselves, but the destination they point to can change or stop working.",
  },
  {
    question: "Can I create a Wi-Fi QR code?",
    answer: "Yes. You can choose WPA/WPA2, WEP or open network and include hidden-network settings.",
  },
  {
    question: "Can I add a logo?",
    answer: "Yes. Logo upload is supported locally, and high error correction is used automatically when a logo is present.",
  },
  {
    question: "Can I download PNG and SVG?",
    answer: "Yes. Standard PNG, high-resolution PNG, transparent PNG and SVG downloads are available.",
  },
  {
    question: "Is my QR data uploaded?",
    answer: "No. QR generation, previews, logos and downloads happen in your browser.",
  },
];

const relatedTools = [
  { label: "WhatsApp Link Generator", href: "/whatsapp-link-generator" },
  { label: "Invoice Generator", href: "/invoice-generator" },
  { label: "Quotation Generator", href: "/quotation-generator" },
  { label: "Receipt Generator", href: "/receipt-generator" },
];

export default function QrCodeGeneratorPage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <QrCodeGenerator />

      <section className="qr-no-print px-6 pb-24 pt-10 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <p className="mb-4 text-sm font-bold text-[#589037]">QR guide</p>
              <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">Create scannable codes for real-world actions.</h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-300">
                Build QR codes for pages, contact details, messages, events and payments. Pair this with the{" "}
                <Link href="/whatsapp-link-generator" className="font-bold text-[#589037]">
                  WhatsApp Link Generator
                </Link>{" "}
                when you need a direct chat link first.
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
