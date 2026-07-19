
import BlogCard from "@/components/blog/BlogCard";
import { blogPosts } from "@/data/blogPosts";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="px-6 pb-20 pt-36 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-bold text-[#589037]">Anulen Blog</p>

          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">
            Insights for better websites, systems, and digital growth.
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-neutral-500 dark:text-neutral-300">
            Practical articles for business owners who want stronger websites, better user experience, and smarter digital systems.
          </p>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
