"use client";

import {
  ArrowRight,
  Code2,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AnimatedContainer from "@/components/ui/AnimatedContainer";

const aboutCards = [
  {
    title: "Strategy",
    desc: "We understand your business, audience, goals, and the real problem your digital product needs to solve.",
    icon: Lightbulb,
  },
  {
    title: "Design",
    desc: "We create clean interfaces that make your brand feel modern, trustworthy, and easy to understand.",
    icon: ShieldCheck,
  },
  {
    title: "Development",
    desc: "We build fast, responsive, scalable websites and systems with clean modern technologies.",
    icon: Code2,
  },
  {
    title: "Launch",
    desc: "We help you go live properly with SEO basics, performance checks, and smooth user experience.",
    icon: Rocket,
  },
];

const stats = [
  { value: "4+", label: "Core services" },
  { value: "100%", label: "Responsive builds" },
  { value: "SEO", label: "Ready structure" },
];

export default function About() {
  return (
    <section id="about" className="bg-[#f7f7f4] px-3 py-8 dark:bg-black">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white px-6 py-16 md:px-12 lg:px-14 dark:bg-black">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <AnimatedContainer>
            <p className="mb-4 text-sm font-bold text-[#589037]">About Anulen</p>

            <h2 className="max-w-3xl text-4xl font-black leading-[1] tracking-[-0.055em] md:text-6xl">
              We don’t just build websites. We build business systems that create trust.
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-500 dark:text-neutral-300">
              Anulen is a modern digital agency helping businesses turn ideas into polished websites, e-commerce platforms, CRM tools, and automation
              systems. Every project is built around clarity, performance, strong design, and real business outcomes.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <a
                href="#contact"
                className="inline-flex items-center gap-4 rounded-full bg-black px-7 py-4 text-sm font-bold text-white transition hover:scale-[1.03] dark:bg-white dark:text-black"
              >
                Work with us
                <ArrowRight size={18} />
              </a>

              <a href="#case-study" className="border-b border-black text-sm font-bold dark:border-white">
                View our work
              </a>
            </div>
          </AnimatedContainer>

          <AnimatedContainer delay={0.12}>
            <div className="relative overflow-hidden rounded-[2rem] bg-[#03070b] p-7 text-white">
              <div className="absolute right-[-60px] top-[-60px] h-56 w-56 rounded-full bg-[#9bff63]/25 blur-3xl" />
              <div className="absolute bottom-[-80px] left-[-80px] h-56 w-56 rounded-full bg-[#9bff63]/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-20 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black">
                  <Sparkles size={24} />
                </div>

                <h3 className="max-w-md text-3xl font-black leading-tight tracking-[-0.045em] md:text-4xl">
                  Built for businesses that need more than an online presence.
                </h3>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                  We focus on the full experience: what people see, what they understand, how fast it loads, how easy it is to use, and how well it
                  supports growth.
                </p>

                <div className="mt-10 grid grid-cols-3 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                      <h4 className="text-2xl font-black tracking-[-0.04em]">{stat.value}</h4>
                      <p className="mt-2 text-xs leading-5 text-white/50">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedContainer>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {aboutCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <AnimatedContainer
                key={card.title}
                delay={index * 0.06}
                className="rounded-[2rem] border border-black/5 bg-[#f7f7f4] p-7 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:border-white/10 dark:bg-black dark:hover:bg-black"
              >
                <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#589037] dark:bg-white/10">
                  <Icon size={22} />
                </div>

                <h3 className="text-xl font-black tracking-[-0.04em]">{card.title}</h3>

                <p className="mt-4 text-sm leading-6 text-neutral-500 dark:text-neutral-300">{card.desc}</p>
              </AnimatedContainer>
            );
          })}
        </div>
      </div>
    </section>
  );
}
