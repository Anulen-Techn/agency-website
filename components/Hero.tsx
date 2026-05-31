import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden px-5 pt-28 pb-16">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-title">Digital design & systems</p>
          <h1 className="section-heading">Modern websites and digital systems for growing businesses.</h1>
          <p className="mt-6 section-copy">
            Anulen helps ambitious companies launch websites, ecommerce, automation, and connected business systems with clarity and confidence.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#contact" className="btn-primary">
              Start a Project
            </a>
            <a href="#services" className="btn-secondary">
              View Services
            </a>
          </div>
        </div>

        <div className="mt-14 hero-image rounded-[2rem] shadow-[0_40px_120px_rgba(0,0,0,0.45)]" />
      </div>
    </section>
  );
}
