import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { blogContent } from "@/lib/blogContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const loadContent = blogContent[slug as keyof typeof blogContent];

  if (!loadContent) {
    return {
      title: "Article Not Found | Anulen",
    };
  }

  const { metadata } = await loadContent();

  return {
    title: metadata.title,
    description: metadata.excerpt,

    openGraph: {
      title: metadata.title,
      description: metadata.excerpt,
      type: "article",
    },

    twitter: {
      title: metadata.title,
      description: metadata.excerpt,
      card: "summary_large_image",
    },
  };
}

export default async function SingleBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const loadContent = blogContent[slug as keyof typeof blogContent];

  if (!loadContent) {
    return notFound();
  }

  const { default: BlogContent, metadata } = await loadContent();

  return (
    <main className="min-h-screen bg-white text-black">
      <article className="px-6 pb-32 pt-36 md:px-12 lg:px-20">
        <div className="max-w-6xl">
          <Link href="/blog" className="inline-flex items-center gap-3 text-sm font-semibold text-neutral-500 transition hover:text-black">
            <ArrowLeft size={16} />
            Back to articles
          </Link>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <span className="rounded-full bg-[#eef7e8] px-4 py-2 text-sm font-bold text-[#589037]">{metadata.category}</span>

            <span className="flex items-center gap-2 text-sm text-neutral-400">
              <Clock3 size={14} />
              {metadata.readTime}
            </span>
          </div>

          <h1 className="mt-10 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">{metadata.title}</h1>

          <p className="mt-10 max-w-3xl text-xl leading-9 text-neutral-500  line-clamp-3">{metadata.excerpt}</p>

          <div className="my-20 h-px w-full bg-black/10" />

          <div
            className="
              prose
              prose-lg
              max-w-none
              prose-headings:font-black
              prose-headings:tracking-[-0.04em]
              prose-p:text-neutral-600
              prose-p:leading-9
              prose-a:text-[#589037]
              prose-a:no-underline
              prose-strong:text-black
            "
          >
            <BlogContent />
          </div>
        </div>
      </article>
    </main>
  );
}
