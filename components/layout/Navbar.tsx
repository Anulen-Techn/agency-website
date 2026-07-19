"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "../ui/Logo";
import { services } from "@/data/services";
import { tools } from "@/data/tools";
// import ThemeToggle from "@/components/theme/ThemeToggle";

type NavDropdownItem = {
  label: string;
  href: string;
};

type NavLink = {
  label: string;
  href: string;
  dropdown?: NavDropdownItem[];
};

const navLinks: NavLink[] = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  {
    label: "Services",
    href: "/#services",
    dropdown: services.map((service) => ({
      label: service.shortTitle,
      href: `/services/${service.slug}`,
    })),
  },
  // { label: "Case study", href: "/#case-study" },
  // { label: "Resources", href: "/#resources" },
  {
    label: "Tools",
    href: "/tools",
    dropdown: tools.map((tool) => ({
      label: tool.title,
      href: tool.href,
    })),
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  const closeMobileMenu = () => {
    setIsOpen(false);
    setOpenMobileDropdown(null);
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-6 py-6 md:px-12 lg:px-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-white p-3 transition-colors dark:bg-black">
        <Logo />

        <div className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => {
            const hasDropdown = !!link.dropdown?.length;

            return (
              <div key={link.label} className="group relative">
                <Link href={link.href} className="flex items-center gap-1 text-sm font-[600] text-black transition hover:text-[#589037] dark:text-white">
                  {link.label}
                  {hasDropdown && <ChevronDown size={14} strokeWidth={2.5} className="transition group-hover:rotate-180" />}
                </Link>

                {hasDropdown && (
                  <div className="invisible absolute left-1/2 top-full mt-4 w-64 -translate-x-1/2 rounded-[1.5rem] bg-white p-3 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:mt-3 group-hover:opacity-100 dark:bg-black">
                    {link.dropdown?.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block rounded-full px-5 py-3 text-sm font-[600] text-black transition hover:bg-[#f4f7ff] hover:text-[#589037] dark:text-white dark:hover:bg-white/10"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#contact"
            className="hidden rounded-full border border-black px-7 py-3 text-sm font-bold transition hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black sm:inline-flex"
          >
            Get started
          </Link>

          {/* <ThemeToggle /> */}

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black lg:hidden"
            aria-label="Toggle mobile navigation"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="mx-auto mt-3 max-w-7xl rounded-[2rem] bg-white p-5 shadow-xl dark:bg-black lg:hidden">
          {navLinks.map((link) => {
            const hasDropdown = !!link.dropdown?.length;
            const dropdownIsOpen = openMobileDropdown === link.label;

            return (
              <div key={link.label}>
                <div className="flex items-center gap-2">
                  <Link
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex flex-1 rounded-full px-5 py-4 text-sm font-[600] text-black hover:bg-[#f4f7ff] hover:text-[#589037] dark:text-white dark:hover:bg-white/10"
                  >
                    {link.label}
                  </Link>

                  {hasDropdown && (
                    <button
                      onClick={() => setOpenMobileDropdown(dropdownIsOpen ? null : link.label)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f7ff] dark:bg-white/10"
                      aria-label={`Toggle ${link.label} dropdown`}
                    >
                      <ChevronDown size={16} className={`transition ${dropdownIsOpen ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>

                {hasDropdown && dropdownIsOpen && (
                  <div className="mb-2 ml-4 rounded-[1.5rem] bg-[#f7f7f4] p-2 dark:bg-black">
                    {link.dropdown?.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="block rounded-full px-5 py-3 text-sm font-[600] text-neutral-600 hover:bg-white hover:text-[#589037] dark:text-neutral-300 dark:hover:bg-white/10"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Link
            href="/#contact"
            onClick={closeMobileMenu}
            className="mt-3 flex justify-center rounded-full bg-black px-7 py-4 text-sm font-bold text-white dark:bg-white dark:text-black"
          >
            Get started
          </Link>
        </div>
      )}
    </header>
  );
}
