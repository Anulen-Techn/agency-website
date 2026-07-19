"use client";

import { TrendingUp } from "lucide-react";
import Button from "@/components/ui/Button";
import AnimatedContainer from "@/components/ui/AnimatedContainer";

export default function Hero() {
  return (
    <section id="home" className="min-h-screen px-6 pb-16 pt-16 dark:scroll-mt-32 dark:bg-black md:px-12 lg:px-20 lg:pt-18">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <AnimatedContainer>
          <h1 className="max-w-3xl text-[3.2rem] font-black leading-[0.98] tracking-[-0.065em] md:text-[5.4rem] lg:text-[5.7rem]">
            Stay ahead of the curve with our forward-thinking
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-neutral-500 dark:text-neutral-300">
            Anulen builds premium websites, digital platforms, and business systems focused on clarity, performance, and measurable growth.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-9">
            <Button>Schedule Call</Button>
            <a href="#case-study" className="border-b border-black text-sm font-bold dark:border-white">
              View Case Study
            </a>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.15} className="relative">
          <div className="grid grid-cols-[1.1fr_0.95fr] gap-6">
            <div className="relative h-64 overflow-visible rounded-[2rem]">
              <div className="absolute bottom-0 right-0 h-56 w-full rounded-br-[1.2rem] rounded-tl-[9rem] rounded-tr-[1rem] bg-gradient-to-br from-neutral-100 via-neutral-300 to-neutral-400 shadow-inner" />
              <div className="absolute right-10 top-2 flex h-24 w-24 items-center justify-center rounded-full bg-black shadow-2xl">
                <TrendingUp size={42} className="text-[#9bff63]" />
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-white/75 p-8 shadow-sm dark:bg-white/10">
              <h2 className="text-7xl font-black leading-none tracking-[-0.07em]">30+</h2>
              <p className="mt-5 text-sm leading-6 text-neutral-500 dark:text-neutral-300">websites, tools, and systems designed to help brands grow.</p>
              <div className="mt-9 h-1.5 rounded-full bg-neutral-200 dark:bg-white/15">
                <div className="h-full w-[72%] rounded-full bg-black dark:bg-white" />
              </div>
            </div>
          </div>

          <div className="relative mt-6 overflow-hidden rounded-[1.6rem] bg-black p-8 text-white">
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-4 text-xs font-semibold">
                <span className="h-px w-12 bg-white/70" />
                <span>Drive More Leads and Sales</span>
              </div>

              <h3 className="max-w-sm text-3xl font-black leading-tight tracking-[-0.05em]">
                Build websites that convert attention into real business
              </h3>
            </div>

            <div className="absolute bottom-0 right-6 hidden items-end gap-3 md:flex">
              <div className="h-24 w-16 bg-[#c3ef8d]" />
              <div className="h-32 w-16 bg-[#94d05d]" />
              <div className="h-40 w-16 bg-[#75b246]" />
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}
