"use client";

import { ArrowRight, CalendarDays } from "lucide-react";
import AnimatedContainer from "@/components/ui/AnimatedContainer";

const calendlyUrl = "https://calendly.com/anulenofficial";

export default function ContactForm() {
  return (
    <section className="px-3 py-4">
      <div className="mx-auto grid max-w-7xl gap-6 rounded-[2rem] bg-white p-6 md:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-14 dark:bg-black">
        <AnimatedContainer>
          <div className="rounded-[2rem] bg-[#03070b] p-8 text-white lg:min-h-full">
            <p className="mb-4 text-sm font-bold text-[#9bff63]">Start here</p>

            <h2 className="text-4xl font-black leading-tight tracking-[-0.05em]">Send us your project details.</h2>

            <p className="mt-6 text-sm leading-7 text-white/60">
              You do not need to have everything figured out. Share what you know, and we’ll help you shape the right digital solution.
            </p>

            <div className="mt-10 space-y-5 text-sm text-white/70">
              <p>✓ Business websites</p>
              <p>✓ E-commerce platforms</p>
              <p>✓ CRM tools and dashboards</p>
              <p>✓ Automation systems</p>
            </div>

            <a
              href={calendlyUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-10 inline-flex items-center gap-4 rounded-full bg-white px-7 py-4 text-sm font-bold text-black transition hover:scale-[1.03]"
            >
              Book a call
              <CalendarDays size={18} />
            </a>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.12}>
          <form className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold">Full name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-5 py-4 text-sm outline-none focus:border-[#2f80ff] dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-neutral-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-5 py-4 text-sm outline-none focus:border-[#2f80ff] dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-neutral-500"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold">Phone number</label>
                <input
                  type="tel"
                  placeholder="+234..."
                  className="w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-5 py-4 text-sm outline-none focus:border-[#2f80ff] dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-neutral-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Project type</label>
                <select className="w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-5 py-4 text-sm outline-none focus:border-[#2f80ff] dark:border-white/10 dark:bg-black dark:text-white">
                  <option>Website Development</option>
                  <option>E-commerce Development</option>
                  <option>CRM Development</option>
                  <option>Business Automation</option>
                  <option>Not sure yet</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Project budget</label>
              <select className="w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-5 py-4 text-sm outline-none focus:border-[#2f80ff] dark:border-white/10 dark:bg-black dark:text-white">
                <option>Select a budget range</option>
                <option>₦100,000 - ₦300,000</option>
                <option>₦300,000 - ₦700,000</option>
                <option>₦700,000 - ₦1,500,000</option>
                <option>₦1,500,000+</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Tell us about the project</label>
              <textarea
                rows={6}
                placeholder="What do you want to build?"
                className="w-full resize-none rounded-2xl border border-black/10 bg-[#f7f7f4] px-5 py-4 text-sm outline-none focus:border-[#2f80ff] dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-neutral-500"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-fit items-center gap-4 rounded-full bg-black px-8 py-4 text-sm font-bold text-white transition hover:scale-[1.03] dark:bg-white dark:text-black"
            >
              Send message
              <ArrowRight size={18} />
            </button>
          </form>
        </AnimatedContainer>
      </div>
    </section>
  );
}
