"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AnimatedContainer from "@/components/ui/AnimatedContainer";

const faqs = [
  {
    q: "What should I include in my project message?",
    a: "Include what you want to build, your business type, the main features you need, your budget range, timeline, and any website or design examples you like.",
  },
  {
    q: "Can I contact Anulen if I only have an idea?",
    a: "Yes. You can contact us even if your idea is not fully clear yet. We can help you shape it into a practical website, platform, or business system.",
  },
  {
    q: "Do you work with businesses outside Aba?",
    a: "Yes. Anulen can work with clients in different locations through online communication, calls, and structured project updates.",
  },
  {
    q: "Can you connect the contact form to email?",
    a: "Yes. The form can be connected to email using services like Zoho Mail, Resend, Nodemailer, or other backend email solutions.",
  },
];

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="px-3 py-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white px-6 py-14 md:px-14 dark:bg-black">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <AnimatedContainer>
            <p className="mb-4 text-sm font-bold text-[#589037]">Contact FAQs</p>

            <h2 className="text-4xl font-black tracking-[-0.05em] md:text-5xl">Before you send a message.</h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-neutral-500 dark:text-neutral-300">
              These answers help you know what to expect when reaching out to Anulen.
            </p>
          </AnimatedContainer>

          <div>
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={faq.q} className="border-t border-black py-6 last:border-b dark:border-white/20">
                  <button onClick={() => setOpenIndex(isOpen ? -1 : index)} className="flex w-full items-start justify-between gap-8 text-left">
                    <h3 className="text-xl font-black tracking-[-0.04em]">{faq.q}</h3>

                    <span className="mt-1 shrink-0">{isOpen ? <Minus size={20} /> : <Plus size={20} />}</span>
                  </button>

                  <div
                    className={`grid overflow-hidden transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-300">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
