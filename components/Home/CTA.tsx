import Button from "@/components/ui/Button";

export default function CTA() {
  return (
    <section id="contact" className="px-3 py-8">
      <div className="flex flex-col items-start justify-between gap-8 rounded-[2rem] bg-[#03070b] px-8 py-14 text-white md:flex-row md:items-center md:px-14">
        <h2 className="text-5xl font-black tracking-[-0.06em] md:text-7xl">Ready to work with us?</h2>

        <Button variant="light">Get Started</Button>
      </div>
    </section>
  );
}
