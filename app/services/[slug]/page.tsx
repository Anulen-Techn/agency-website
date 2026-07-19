import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Database, Globe2, MessageCircle, ShoppingCart, Workflow } from "lucide-react";
import { getServiceBySlug, services } from "@/data/services";

const iconMap = {
  globe: Globe2,
  cart: ShoppingCart,
  workflow: Workflow,
  message: MessageCircle,
  database: Database,
  code: Code2,
};

export function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found | Anulen",
    };
  }

  return {
    title: `${service.title} | Anulen`,
    description: service.excerpt,
    openGraph: {
      title: `${service.title} | Anulen`,
      description: service.excerpt,
      type: "website",
    },
    twitter: {
      title: `${service.title} | Anulen`,
      description: service.excerpt,
      card: "summary_large_image",
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return notFound();
  }

  const Icon = iconMap[service.icon];

  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="px-6 pb-24 pt-36 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <Link href="/#services" className="inline-flex items-center gap-3 text-sm font-semibold text-neutral-500 transition hover:text-black dark:text-neutral-300 dark:hover:text-white">
            <ArrowLeft size={16} />
            Back to services
          </Link>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="mb-5 text-sm font-bold text-[#589037]">{service.eyebrow}</p>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">{service.title}</h1>
              <p className="mt-8 max-w-3xl text-lg leading-9 text-neutral-500 dark:text-neutral-300">{service.description}</p>
            </div>

            <div className="rounded-[2rem] bg-[#03070b] p-8 text-white">
              <div className="mb-16 flex h-14 w-14 items-center justify-center rounded-full bg-[#9bff63] text-black">
                <Icon size={25} />
              </div>

              <h2 className="max-w-md text-3xl font-black leading-tight tracking-[-0.045em]">What this service helps you achieve</h2>

              <div className="mt-8 grid gap-4">
                {service.outcomes.map((outcome) => (
                  <div key={outcome} className="flex gap-3 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/70">
                    <CheckCircle2 size={18} className="mt-1 shrink-0 text-[#9bff63]" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f4] px-3 py-8 dark:bg-black">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-[2rem] bg-white px-6 py-16 md:px-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-14 dark:bg-black">
          <div>
            <p className="mb-4 text-sm font-bold text-[#589037]">How we approach it</p>
            <h2 className="max-w-xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">A focused process from idea to launch.</h2>
          </div>

          <div className="grid gap-4">
            {service.process.map((step, index) => (
              <div key={step} className="grid gap-5 rounded-[1.5rem] bg-[#f7f7f4] p-6 md:grid-cols-[4rem_1fr] dark:bg-black">
                <span className="text-3xl font-black tracking-[-0.04em] text-[#589037]">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-base leading-8 text-neutral-600 dark:text-neutral-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-sm font-bold text-[#589037]">Service detail</p>
            <h2 className="text-4xl font-black tracking-[-0.05em] md:text-5xl">Built around your real workflow.</h2>
          </div>

          <div className="grid gap-6">
            {service.details.map((detail) => (
              <p key={detail} className="border-l border-black/10 pl-6 text-lg leading-9 text-neutral-600 dark:border-white/10 dark:text-neutral-300">
                {detail}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 pb-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-[#03070b] px-8 py-14 text-white md:flex-row md:items-center md:px-14">
          <h2 className="max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-6xl">Ready to discuss {service.shortTitle.toLowerCase()}?</h2>

          <Link
            href="/Contact"
            className="inline-flex items-center gap-4 rounded-full bg-white px-7 py-4 text-sm font-bold text-black transition hover:scale-[1.03]"
          >
            Start a conversation
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
