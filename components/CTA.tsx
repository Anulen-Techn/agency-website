import { Mail, MessageCircle } from "lucide-react";

export default function CTA() {
  return (
    <section id="contact" className="section bg-white/[0.04]">
      <div className="container">
        <div className="card rounded-[2.25rem] p-10 md:p-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-title">Ready to build</p>
            <h2 className="section-heading">Ready to build something great?</h2>
            <p className="mt-5 section-copy text-white/70">
              Let’s create a modern website and system that helps your business scale with confidence.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="mailto:hello@anulen.com" className="btn-primary">
                <Mail size={18} /> hello@anulen.com
              </a>
              <a href="https://wa.me/" className="btn-secondary">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
