import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactHero from "@/components/Contact/ContactHero";
import ContactForm from "@/components/Contact/ContactForm";
import ContactInfo from "@/components/Contact/ContactInfo";
import ContactFAQ from "@/components/Contact/ContactFAQ";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <ContactHero />
        <ContactForm />
        <ContactInfo />
        <ContactFAQ />
      </main>
      <Footer />
    </>
  );
}
