import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { tools } from "@/data/tools";

export const metadata: Metadata = {
  title: "Tools | Anulen",
  description: "Explore free business tools from Anulen, starting with a professional invoice generator for creating, printing and downloading invoices.",
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="px-6 pb-24 pt-8 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-bold text-[#589037]">Anulen Tools</p>

          <div>
            <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">Useful tools for modern businesses.</h1>

            <p className="mt-8 max-w-3xl text-base leading-8 text-neutral-500 dark:text-neutral-300">
              Anulen tools are simple browser-based utilities designed to help businesses handle everyday digital tasks faster, starting with the
              invoice generator for creating clean client invoices without an account, backend setup, or complicated software. More tools are coming.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => (
              <article
                key={tool.href}
                className="group flex min-h-[320px] flex-col rounded-[1.75rem] border border-black/5 bg-[#f7f7f4] p-7 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:border-white/10 dark:bg-black dark:hover:bg-black"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#589037] shadow-sm dark:bg-white/10">
                    <Wrench size={22} />
                  </div>

                  <span className="text-sm text-neutral-400 dark:text-neutral-500">{String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className="mt-10 flex flex-1 flex-col">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#589037]">{tool.eyebrow}</p>
                  <h2 className="text-2xl font-black leading-tight tracking-[-0.04em]">{tool.title}</h2>
                  <p className="mt-5 text-sm leading-7 text-neutral-500 dark:text-neutral-300">{tool.description}</p>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <span className="rounded-full bg-[#eef7e8] px-4 py-2 text-xs font-bold text-[#589037]">{tool.status}</span>

                    <Link
                      href={tool.href}
                      className="inline-flex items-center gap-3 border-b border-black text-sm font-bold transition group-hover:text-[#589037] dark:border-white"
                    >
                      Open tool
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
