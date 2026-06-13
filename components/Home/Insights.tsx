"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedContainer from "@/components/ui/AnimatedContainer";
import { blogPosts } from "@/data/blogPosts";

export default function Insights() {
  return (
    <section id="resources" className="bg-white px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2">
          <AnimatedContainer>
            <h2 className="max-w-2xl text-4xl font-black leading-tight tracking-[-0.055em] md:text-5xl">
              Insights for better websites, systems, and digital growth.
            </h2>
          </AnimatedContainer>

          <AnimatedContainer delay={0.1}>
            <p className="max-w-xl text-sm leading-7 text-neutral-500">
              Practical articles for business owners who want stronger websites, better user experience, and smarter digital systems.
            </p>

            <Link
              href="/blog"
              className="mt-8 inline-flex rounded-full border border-black px-8 py-4 text-sm font-bold transition hover:bg-black hover:text-white"
            >
              See more
            </Link>
          </AnimatedContainer>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {blogPosts.slice(0, 3).map((post, index) => (
            <AnimatedContainer
              key={post.slug}
              delay={index * 0.08}
              className="group rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-6 flex justify-between text-xs text-neutral-400">
                <span className="h-3 w-3 rounded-full bg-[#6fd931]" />
                <span>{post.readTime}</span>
              </div>

              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#589037]">{post.category}</p>

              <h3 className="text-2xl font-black leading-tight tracking-[-0.04em]">{post.title}</h3>

              <div className="mt-12 flex items-end justify-between">
                <p className="max-w-[190px] text-xs leading-6 text-neutral-500  line-clamp-3">{post.excerpt}</p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="flex h-12 w-16 items-center justify-center rounded-full border border-black transition group-hover:bg-black group-hover:text-white"
                >
                  <ArrowRight size={18} />
                </Link>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
