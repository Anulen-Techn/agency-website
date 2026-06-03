"use client";

import { ArrowRight } from "lucide-react";
import AnimatedContainer from "@/components/ui/AnimatedContainer";

const posts = [
  "How a Professional Website Can Boost Your Business",
  "The Latest Trends and Strategies in Web Development",
  "Maximizing ROI with the Expertise of a Digital Agency",
];

export default function Insights() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2">
          <AnimatedContainer>
            <h2 className="max-w-2xl text-4xl font-black leading-tight tracking-[-0.055em] md:text-5xl">
              Digital Marketing & SEO Services That Grow Traffic & Increase Revenue
            </h2>
          </AnimatedContainer>

          <AnimatedContainer delay={0.1}>
            <p className="max-w-xl text-sm leading-7 text-neutral-500">
              We create useful content and digital systems that help businesses improve visibility, generate leads, and convert attention into
              measurable results.
            </p>

            <button className="mt-8 rounded-full border border-black px-8 py-4 text-sm font-bold">See more</button>
          </AnimatedContainer>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {posts.map((post, index) => (
            <AnimatedContainer key={post} delay={index * 0.08} className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="mb-6 flex justify-between text-xs text-neutral-400">
                <span className="h-3 w-3 rounded-full bg-[#6fd931]" />
                <span>5 min read</span>
              </div>

              <h3 className="text-2xl font-black leading-tight tracking-[-0.04em]">{post}</h3>

              <div className="mt-12 flex items-end justify-between">
                <p className="max-w-[190px] text-xs leading-6 text-neutral-500">
                  Practical insights for business owners who want better digital results.
                </p>

                <button className="flex h-12 w-16 items-center justify-center rounded-full border border-black transition hover:bg-black hover:text-white">
                  <ArrowRight size={18} />
                </button>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
