import About from "@/components/Home/About";
import CTA from "@/components/Home/CTA";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/Home/Hero";
import Navbar from "@/components/layout/Navbar";
import FeaturedWork from "@/components/Home/FeaturedWork";
import Testimonials from "@/components/Home/Testimonials";
import FAQ from "@/components/Home/FAQ";
import Insights from "@/components/Home/Insights";
import ContactSection from "@/components/Home/ContactSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <FeaturedWork />
      <ContactSection />
      <Testimonials />
      <FAQ />
      <Insights />
      <CTA />
    </main>
  );
}
