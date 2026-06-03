"use client";

import { Mail, MapPin, Phone, Timer } from "lucide-react";
import AnimatedContainer from "@/components/ui/AnimatedContainer";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    text: "hello@anulen.com",
  },
  {
    icon: Phone,
    title: "Phone",
    text: "+234 813 189 1721",
  },
  {
    icon: MapPin,
    title: "Location",
    text: "Aba, Abia State, Nigeria",
  },
  {
    icon: Timer,
    title: "Response time",
    text: "Usually within 24 hours",
  },
];

export default function ContactInfo() {
  return (
    <section className="px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <AnimatedContainer>
          <h2 className="max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">Simple ways to reach Anulen.</h2>
        </AnimatedContainer>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item, index) => {
            const Icon = item.icon;

            return (
              <AnimatedContainer key={item.title} delay={index * 0.06} className="rounded-[2rem] bg-white p-7 shadow-sm">
                <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#eefff2] text-[#589037]">
                  <Icon size={22} />
                </div>

                <h3 className="text-xl font-black tracking-[-0.04em]">{item.title}</h3>

                <p className="mt-4 text-sm leading-6 text-neutral-500">{item.text}</p>
              </AnimatedContainer>
            );
          })}
        </div>
      </div>
    </section>
  );
}
