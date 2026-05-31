import { Code2, Compass, LayoutGrid, Rocket } from "lucide-react";

const steps = [
  {
    icon: Compass,
    title: "Discover what matters",
    text: "Understand audience, goals, and the right digital strategy.",
  },
  {
    icon: LayoutGrid,
    title: "Plan the right approach",
    text: "Design clear systems that scale with your business needs.",
  },
  {
    icon: Code2,
    title: "Build with precision",
    text: "Craft fast, reliable websites and tools for modern teams.",
  },
  {
    icon: Rocket,
    title: "Launch and measure",
    text: "Deploy confidently and optimize based on real outcomes.",
  },
];

export default function Process() {
  return (
    <section id="process" className="section bg-[#020613]">
      <div className="container">
        <div className="max-w-2xl">
          <p className="section-title">Process</p>
          <h2 className="section-heading">How we build your digital future.</h2>
          <p className="mt-4 section-copy">
            A streamlined development process that keeps every launch fast, clear, and grounded in measurable results.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="card card-strong rounded-[2rem] p-8">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-white/5 text-blue-300">
                  <Icon size={24} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-4 leading-8 text-white/65">{step.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
