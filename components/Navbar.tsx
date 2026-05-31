"use client";

import Logo from "./Logo";

const links = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050b13]/85 backdrop-blur-xl">
      <nav className="container flex h-20 items-center justify-between gap-4">
        <a href="#home" aria-label="Go to Anulen homepage" className="flex items-center gap-3">
          <Logo />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm uppercase tracking-[0.18em] text-white/70 transition hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <a href="#contact" className="btn-primary hidden text-sm md:inline-flex">
          Start a Project
        </a>
      </nav>
    </header>
  );
}
