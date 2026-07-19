import type { Metadata } from "next";
import Link from "next/link";
import ImageTools from "@/components/image-tools/ImageTools";

export const metadata: Metadata = {
  title: "Free Background Remover | Anulen Technologies",
  description: "Remove image backgrounds online, preserve internal details and download transparent PNG files or images with replacement backgrounds.",
  alternates: {
    canonical: "https://anulen.com/background-remover",
  },
  openGraph: {
    title: "Free Background Remover | Anulen Technologies",
    description: "Remove image backgrounds online, preserve internal details and download transparent PNG files or images with replacement backgrounds.",
    url: "https://anulen.com/background-remover",
    type: "website",
  },
  twitter: {
    title: "Free Background Remover | Anulen Technologies",
    description: "Remove image backgrounds online, preserve internal details and download transparent PNG files or images with replacement backgrounds.",
    card: "summary_large_image",
  },
};

const guideSections = [
  {
    title: "How background removal works",
    body: "The plain remover builds a transparency mask from the selected background colour. Connected mode starts from the image edges to avoid removing similar colours inside the subject.",
  },
  {
    title: "Why white details stay safer",
    body: "Deleting every white pixel would damage white letters, clothing and product details. Connected background removal is safer because it targets the outside background first.",
  },
  {
    title: "Choosing the background colour",
    body: "Click the image preview to sample the background, or choose a colour manually. For logos and product shots, choose the colour closest to the outer background.",
  },
  {
    title: "Tolerance and softness",
    body: "Tolerance controls how many similar colours are removed. Softness feathers the edge so cutouts look less harsh. Increase both carefully.",
  },
  {
    title: "Transparent image formats",
    body: "Download transparent results as PNG. If you choose a solid replacement background, JPG and WebP downloads are also useful options.",
  },
  {
    title: "Limitations",
    body: "Results can vary with hair, fur, transparent objects, shadows, complex backgrounds, low-resolution images and foreground colours that closely match the background.",
  },
];

const faqs = [
  { question: "Is the background remover free?", answer: "Yes. The plain background remover is free to use in your browser." },
  { question: "Are my images uploaded?", answer: "No. The implemented plain-removal workflow processes images locally in your browser." },
  { question: "Can the tool preserve white details?", answer: "Yes, where practical. Connected mode helps preserve internal white areas that are not connected to the outer background." },
  { question: "Why did it remove part of my image?", answer: "The colour tolerance may be too high, or global removal may be too aggressive. Use connected mode and lower the tolerance." },
  { question: "Can I replace the background?", answer: "Yes. Choose transparent, white, black, a custom colour or an uploaded replacement background image." },
  { question: "Which formats can I download?", answer: "Transparent results download as PNG. Solid-background results can be exported as JPG, PNG or WebP." },
  { question: "Does AI background removal work?", answer: "The page includes an AI mode placeholder, but the local model package is not available in this build yet. Plain removal works now." },
  { question: "Can I use it on mobile?", answer: "Yes. Controls appear first and the preview appears below on smaller screens." },
];

const relatedTools = [
  { label: "Image Compressor", href: "/image-compressor" },
  { label: "QR Code Generator", href: "/qr-code-generator" },
  { label: "WhatsApp Link Generator", href: "/whatsapp-link-generator" },
  { label: "Invoice Generator", href: "/invoice-generator" },
  { label: "Profit Calculator", href: "/profit-calculator" },
];

export default function BackgroundRemoverPage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <ImageTools
        mode="background"
        showTabs={false}
        title="Free Background Remover"
        description="Remove plain image backgrounds, protect internal details, replace backgrounds and download transparent PNG files directly in your browser."
      />

      <GuideSection eyebrow="Background remover guide" title="Cleaner cutouts without deleting every white pixel." intro="Use this remover for logos, simple product shots and graphics with plain backgrounds. Connected background removal helps protect white text, clothing and details that sit inside the subject." guideSections={guideSections} faqs={faqs} relatedTools={relatedTools} />
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
