import Link from "next/link";
import { ArrowRight } from "lucide-react";

type BlogPost = {
  slug: string;
  title: string;
  readTime: string;
  excerpt: string;
  category: string;
};

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-black">
      <div className="flex h-full flex-col p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#589037]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-300">{post.category}</span>
          </div>

          <span className="text-sm text-neutral-400 dark:text-neutral-500">{post.readTime}</span>
        </div>

        <h2 className="max-w-[90%] text-3xl font-black leading-[1.15] tracking-[-0.05em]">{post.title}</h2>

        <div className="mt-8 flex items-end justify-between gap-8">
          <p className="max-w-md text-base leading-8 text-neutral-500  line-clamp-3 dark:text-neutral-300">{post.excerpt}</p>

          <Link
            href={`/blog/${post.slug}`}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-black transition-all duration-300 group-hover:bg-black group-hover:text-white dark:border-white dark:group-hover:bg-white dark:group-hover:text-black"
          >
            <ArrowRight size={22} />
          </Link>
        </div>
      </div>
    </article>
  );
}
