import { ArrowRight, Bot, Globe2, ShoppingCart } from "lucide-react";

const services = [
  {
    icon: Globe2,
    title: "Business Websites",
    text: "Clean, conversion-focused websites built for modern teams.",
  },
  {
    icon: ShoppingCart,
    title: "Ecommerce Platforms",
    text: "Online stores that connect products, payments, and business workflows.",
  },
  {
    icon: Bot,
    title: "Automation & Systems",
    text: "Smart dashboards, CRM flows, and admin tools for daily operations.",
  },
];

export default function Services() {
  return (
    <section id="services" className="section">
      <div className="container">
        <div className="max-w-2xl">
          <p className="section-title">Services</p>
          <h2 className="section-heading">What we build for ambitious teams.</h2>
          <p className="mt-4 section-copy">
            Focused website and system design that helps brands grow with confidence, from launch to long-term digital operations.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title} className="card rounded-[2rem] p-8 transition hover:-translate-y-1 hover:border-blue-400/35">
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600/15 text-blue-200">
                  <Icon size={28} />
                </div>
                <h3 className="text-2xl font-semibold">{service.title}</h3>
                <p className="mt-4 leading-8 text-white/70">{service.text}</p>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">
                  Learn more <ArrowRight size={16} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
