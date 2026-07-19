"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import AnimatedContainer from "@/components/ui/AnimatedContainer";

export default function Testimonials() {
  return (
    <section className="px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <AnimatedContainer>
          <blockquote className="max-w-6xl text-3xl font-black leading-[1.45] tracking-[-0.04em] md:text-4xl">
            “They thoroughly analyze our industry and target audience, allowing them to develop customized digital solutions that effectively reach
            and engage our customers.”
          </blockquote>
        </AnimatedContainer>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-neutral-300 dark:bg-white/20" />
            <div>
              <h4 className="font-black">Michael Kaizer</h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-300">CEO of Basecamp Corp</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="flex h-12 w-16 items-center justify-center rounded-full border border-black dark:border-white">
              <ArrowLeft size={18} />
            </button>
            <span className="text-sm font-bold">01/05</span>
            <button className="flex h-12 w-16 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
