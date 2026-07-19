"use client";

import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";
import AnimatedContainer from "@/components/ui/AnimatedContainer";
import Link from "next/link";

export default function ContactSection() {
  return (
    <section id="contact" className="bg-[#f7f7f4] px-3 py-8 dark:bg-black">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#03070b] px-6 py-16 text-white md:px-12 lg:px-14">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <AnimatedContainer>
            <p className="mb-4 text-sm font-bold text-[#9bff63]">Contact Anulen</p>

            <h2 className="max-w-3xl text-4xl font-black leading-[1] tracking-[-0.055em] md:text-6xl">
              Have a project in mind? Let’s build something serious.
            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/60">
              Whether you need a business website, e-commerce platform, CRM tool, or automation system, Anulen can help you turn the idea into a clean
              and functional digital product.
            </p>

            <Link
              href="/Contact"
              className="mt-9 inline-flex items-center gap-4 rounded-full bg-white px-7 py-4 text-sm font-bold text-black transition hover:scale-[1.03]"
            >
              Start a conversation
              <ArrowRight size={18} />
            </Link>
          </AnimatedContainer>

          <AnimatedContainer delay={0.12}>
            <div className="grid gap-4">
              {[
                {
                  icon: Mail,
                  title: "Email us",
                  text: "hello@anulen.com",
                },
                {
                  icon: Phone,
                  title: "Call us",
                  text: "+234 813 189 1721",
                },
                {
                  icon: MessageCircle,
                  title: "Project inquiry",
                  text: "Tell us what you want to build.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                      <Icon size={21} />
                    </div>

                    <h3 className="text-xl font-black tracking-[-0.04em]">{item.title}</h3>

                    <p className="mt-2 text-sm text-white/55">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </section>
  );
}
