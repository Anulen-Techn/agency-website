import type { Metadata } from "next";
import Link from "next/link";
import ImageTools from "@/components/image-tools/ImageTools";
import AdSenseAd from "@/components/ads/AdSenseAd";
import { ADSENSE_SLOTS } from "@/lib/adsense";

export const metadata: Metadata = {
  title: "Free Image Compressor | Anulen Technologies",
  description: "Compress images and resize photos online. Download optimised JPG, PNG or WebP images for websites, social media and business use.",
  alternates: {
    canonical: "https://anulen.com/image-compressor",
  },
  openGraph: {
    title: "Free Image Compressor | Anulen Technologies",
    description: "Compress images and resize photos online. Download optimised JPG, PNG or WebP images for websites, social media and business use.",
    url: "https://anulen.com/image-compressor",
    type: "website",
  },
  twitter: {
    title: "Free Image Compressor | Anulen Technologies",
    description: "Compress images and resize photos online. Download optimised JPG, PNG or WebP images for websites, social media and business use.",
    card: "summary_large_image",
  },
};

const guideSections = [
  {
    title: "How image compression works",
    body: "Compression reduces file size by storing image data more efficiently. JPG and WebP can trade a little detail for much smaller files, while PNG is useful for crisp graphics and transparency.",
  },
  {
    title: "Lossy versus lossless",
    body: "Lossy compression removes some visual data to reduce size. Lossless compression keeps image data intact, but the file savings are usually smaller.",
  },
  {
    title: "JPG, PNG and WebP",
    body: "Use JPG for photos, PNG for transparent graphics and WebP for a modern balance of quality, small size and transparency support.",
  },
  {
    title: "Why resizing reduces file size",
    body: "Large dimensions create more pixels to store. Resizing a photo to the size your website actually displays can reduce file size dramatically.",
  },
  {
    title: "Compression without too much quality loss",
    body: "Start around 75 to 85 percent quality, compare the preview, and only go lower when the image still looks clean at the size people will view it.",
  },
  {
    title: "Privacy",
    body: "The compressor runs in your browser. Full uploaded images are not saved permanently in localStorage or uploaded to Anulen's servers.",
  },
];

const faqs = [
  { question: "Is the image compressor free?", answer: "Yes. You can compress and download images without creating an account." },
  { question: "Are my images uploaded?", answer: "No. The compression workflow runs locally in your browser." },
  { question: "Which formats are supported?", answer: "PNG, JPG, JPEG and WebP are supported for upload. Downloads can be JPG, PNG or WebP." },
  { question: "Does compression reduce quality?", answer: "It can. Lower quality creates smaller files, but the preview helps you choose a balanced setting." },
  { question: "Can I resize images?", answer: "Yes. You can keep original dimensions, resize by percentage, set custom width and height, and lock the aspect ratio." },
  { question: "Can I preserve transparency?", answer: "Yes. Choose PNG or WebP output for images that need transparent areas." },
  { question: "What is the best format for websites?", answer: "WebP is often the best default. JPG is good for photos, and PNG is better for logos or transparent graphics." },
  { question: "Is there a maximum file size?", answer: "Yes. Uploads are limited to 15 MB, with safeguards for extremely large image dimensions." },
];

const relatedTools = [
  { label: "Background Remover", href: "/background-remover" },
  { label: "QR Code Generator", href: "/qr-code-generator" },
  { label: "WhatsApp Link Generator", href: "/whatsapp-link-generator" },
  { label: "Invoice Generator", href: "/invoice-generator" },
  { label: "Profit Calculator", href: "/profit-calculator" },
];

export default function ImageCompressorPage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <ImageTools
        mode="compress"
        showTabs={false}
        title="Free Image Compressor"
        description="Compress images, resize photos, strip metadata and download optimised JPG, PNG or WebP files directly in your browser."
      />

      <GuideSection eyebrow="Image compressor guide" title="Make images lighter without making them look broken." intro="Use this compressor before uploading website images, social posts, product photos, blog graphics or client assets. It gives you control over quality, dimensions and file format while keeping processing local." guideSections={guideSections} faqs={faqs} relatedTools={relatedTools} />
    </main>
  );
}

function GuideSection({
  eyebrow,
  title,
  intro,
  guideSections,
  faqs,
  relatedTools,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  guideSections: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  relatedTools: Array<{ label: string; href: string }>;
}) {
  return (
    <section className="image-tools-no-print px-6 pb-24 pt-10 dark:bg-black md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
          <div>
            <p className="mb-4 text-sm font-bold text-[#589037]">{eyebrow}</p>
            <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">{title}</h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-300">{intro}</p>
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
  );
}
