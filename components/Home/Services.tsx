"use client";

import Link from "next/link";
import { ArrowRight, Code2, Database, Globe2, MessageCircle, ShoppingCart, Workflow } from "lucide-react";
import AnimatedContainer from "@/components/ui/AnimatedContainer";
import { services } from "@/data/services";

const iconMap = {
  globe: Globe2,
  cart: ShoppingCart,
  workflow: Workflow,
  message: MessageCircle,
  database: Database,
  code: Code2,
};

export default function Services() {
  return (
    <section id="services" className="bg-white px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1fr] lg:items-end">
          <AnimatedContainer>
            <p className="mb-4 text-sm font-bold text-[#589037]">Services</p>
            <h2 className="max-w-3xl text-4xl font-black leading-[1] tracking-[-0.055em] md:text-6xl">
              Digital services built around real business growth.
            </h2>
          </AnimatedContainer>

          <AnimatedContainer delay={0.1}>
            <p className="max-w-xl text-base leading-8 text-neutral-500">
              From polished websites to automation and internal systems, Anulen helps businesses create clearer customer experiences and smoother
              operations.
            </p>
          </AnimatedContainer>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon];

            return (
              <AnimatedContainer
                key={service.slug}
                delay={index * 0.05}
                className="group flex min-h-[320px] flex-col rounded-[1.75rem] border border-black/5 bg-[#f7f7f4] p-7 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#589037] shadow-sm">
                    <Icon size={22} />
                  </div>

                  <span className="text-sm text-neutral-400">{String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className="mt-10 flex flex-1 flex-col">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#589037]">{service.eyebrow}</p>
                  <h3 className="text-2xl font-black leading-tight tracking-[-0.04em]">{service.title}</h3>
                  <p className="mt-5 text-sm leading-7 text-neutral-500">{service.excerpt}</p>

                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-auto inline-flex w-fit items-center gap-3 border-b border-black pt-8 text-sm font-bold transition group-hover:text-[#589037]"
                  >
                    Learn more
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </AnimatedContainer>
            );
          })}
        </div>
      </div>
    </section>
  );
}
