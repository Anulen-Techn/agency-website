import About from "@/components/Home/About";
import CTA from "@/components/Home/CTA";
import Hero from "@/components/Home/Hero";
import Services from "@/components/Home/Services";
import Testimonials from "@/components/Home/Testimonials";
import FAQ from "@/components/Home/FAQ";
import Insights from "@/components/Home/Insights";
import ContactSection from "@/components/Home/ContactSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Services />
      <ContactSection />
      <Testimonials />
      <FAQ />
      <Insights />
      <CTA />
    </main>
  );
}
