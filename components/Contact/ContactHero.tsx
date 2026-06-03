"use client";

import AnimatedContainer from "@/components/ui/AnimatedContainer";

export default function ContactHero() {
  return (
    <section className="px-6 pb-4 pt-8 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <AnimatedContainer>
          <p className="mb-5 text-sm font-bold text-[#589037]">Contact Anulen</p>

          <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.065em] md:text-7xl">
            Let’s talk about the website, system, or platform you want to build.
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-neutral-500">
            Tell us about your business, your goals, and what you need. We’ll help you understand the best way to design, build, and launch it.
          </p>
        </AnimatedContainer>
      </div>
    </section>
  );
}

