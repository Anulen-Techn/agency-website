export default function SectionHeading({ label, title, text }: { label?: string; title: string; text?: string }) {
  return (
    <div>
      {label && <p className="mb-4 text-sm font-bold text-[#2f80ff]">{label}</p>}
      <h2 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.055em] md:text-6xl">{title}</h2>
      {text && <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-500 dark:text-neutral-300">{text}</p>}
    </div>
  );
}
