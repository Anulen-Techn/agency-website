import { ArrowRight } from "lucide-react";

export default function Button({
  children,
  href = "#contact",
  variant = "dark",
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "dark" | "light" | "outline";
}) {
  const styles = {
    dark: "bg-black text-white hover:scale-[1.03] dark:bg-white dark:text-black",
    light: "bg-white text-black hover:scale-[1.03]",
    outline: "border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black",
  };

  return (
    <a href={href} className={`inline-flex items-center gap-5 rounded-full px-7 py-4 text-sm font-bold transition ${styles[variant]}`}>
      {children}
      <ArrowRight size={18} />
    </a>
  );
}
