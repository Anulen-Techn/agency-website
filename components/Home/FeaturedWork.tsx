"use client";

import AnimatedContainer from "@/components/ui/AnimatedContainer";

const tabs = ["All Work [20]", "Website Design [10]", "CRM Tools [5]", "Branding [5]"];

export default function FeaturedWork() {
  return (
    <section id="case-study" className="px-3 py-8">
      <div className="overflow-hidden rounded-[2rem] bg-[#03070b] px-6 py-16 text-white md:px-14">
        <AnimatedContainer>
          <h2 className="mx-auto max-w-5xl text-center text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
            Real-world examples of how we have helped companies achieve their digital objectives.
          </h2>
        </AnimatedContainer>

        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-4">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={`rounded-full border px-10 py-3 text-sm font-bold ${
                index === 1 ? "border-[#9bff63] bg-[#9bff63] text-black" : "border-white/60 text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.9fr_1fr_1fr]">
          <div className="flex aspect-square items-center justify-center rounded-full border-[10px] border-white/30 bg-neutral-300">
            <button className="h-32 w-32 rounded-full bg-[#9bff63] text-sm font-black text-black">See Details</button>
          </div>

          {["Ai Wave - AI Chatbot Mobile App", "App Lancer - Freelance Platform"].map((item) => (
            <div key={item} className="relative h-[360px] rounded-[2rem] border-[8px] border-white/30 bg-neutral-300 p-8">
              <p className="flex items-center gap-4 text-sm font-semibold text-white">
                <span className="h-px w-12 bg-white" />
                Anulen Project. 2026
              </p>

              <h3 className="absolute bottom-8 left-8 text-2xl font-black tracking-[-0.04em] text-white">{item}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
