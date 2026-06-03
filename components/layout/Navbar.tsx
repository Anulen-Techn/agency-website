"use client";

import { useState } from "react";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import Logo from "../ui/Logo";



const navLinks = [
  { label: "Service", hasDropdown: false },
  { label: "Agency", hasDropdown: false },
  { label: "Case study", hasDropdown: false },
  { label: "Resources", hasDropdown: false },
  { label: "Contact", hasDropdown: false },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-6 py-6 md:px-12 lg:px-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-white p-3">
        <Logo />

        <div className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <a href="#" key={link.label} className="flex items-center gap-1 text-sm font-semibold text-black transition hover:text-[#589037]">
              {link.label}
              {link.hasDropdown && <ChevronDown size={14} strokeWidth={2.5} />}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden rounded-full border border-black px-7 py-3 text-sm font-bold transition hover:bg-black hover:text-white sm:inline-flex"
          >
            Get started
          </a>

          <button className="hidden h-12 w-12 items-center justify-center rounded-full bg-black text-white transition hover:scale-105 sm:flex">
            <Bell size={18} />
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white lg:hidden"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="mx-auto mt-3 max-w-7xl rounded-[2rem] bg-white p-5 shadow-xl lg:hidden">
          {navLinks.map((link) => (
            <a
              href="#"
              key={link.label}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-full px-5 py-4 text-sm font-bold hover:bg-[#f4f7ff]"
            >
              {link.label}
              {link.hasDropdown && <ChevronDown size={15} />}
            </a>
          ))}

          <a href="#contact" className="mt-3 flex justify-center rounded-full bg-black px-7 py-4 text-sm font-bold text-white">
            Get started
          </a>
        </div>
      )}
    </header>
  );
}
