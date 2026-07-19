"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AnimatedContainer from "@/components/ui/AnimatedContainer";

const faqs = [
  {
    q: "Why is a professional website important for my business?",
    a: "A professional website helps your business build trust, explain your services clearly, generate leads, and support long-term visibility online. It gives customers a strong first impression before they contact you.",
  },
  {
    q: "Can Anulen build custom tools for my business?",
    a: "Yes. We can build custom CRM tools, dashboards, booking systems, admin panels, e-commerce platforms, and automation systems depending on what your business needs.",
  },
  {
    q: "How long does it take to build a website?",
    a: "A simple business website can take a few days to a few weeks. Larger websites with custom features, payments, dashboards, or admin systems usually take longer depending on the scope.",
  },
  {
    q: "Do you help with SEO and website performance?",
    a: "Yes. We structure websites with SEO foundations such as proper page structure, fast loading speed, responsive design, clean metadata, good content hierarchy, and performance-focused development.",
  },
  {
    q: "Can you redesign an existing website?",
    a: "Yes. We can improve the design, structure, content layout, speed, responsiveness, and user experience of an existing website while keeping the business goals in mind.",
  },
  {
    q: "Do you build e-commerce websites?",
    a: "Yes. We build online stores with product pages, carts, checkout, payment integration, order management, and admin features for managing products and customers.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="px-3 py-8">
      <div className="rounded-[2rem] bg-white px-6 py-14 md:px-14 dark:bg-black">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <AnimatedContainer>
            <h2 className="text-4xl font-black tracking-[-0.05em] md:text-5xl">Anulen FAQs</h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-neutral-500 dark:text-neutral-300">
              Common questions about websites, software, SEO, business systems, and working with Anulen.
            </p>

            <div className="mt-10 flex items-center gap-8">
              <button className="rounded-full border border-black px-7 py-4 text-sm font-bold transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
                More Questions
              </button>

              <a href="#contact" className="border-b border-black text-sm font-bold dark:border-white">
                Contact Us
              </a>
            </div>
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
                    className={`grid overflow-hidden transition-all duration-300 ease-out ${
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
