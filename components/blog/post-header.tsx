import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { formatBlogCategory } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

export function PostHeader({ post }: { post: BlogPost }) {
  return (
    <header className="bg-gray-50 py-12 dark:bg-gray-950 sm:py-16">
      <div className="container-section">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href={`/blog/category/${post.category}`}
            className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
          >
            {formatBlogCategory(post.category)}
          </Link>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-5xl">
            {post.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-gray-500 dark:text-gray-400 sm:text-lg">
            {post.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>{post.author}</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={15} />
              {post.readingTime} min read
            </span>
          </div>
        </div>
        <div className="relative mx-auto mt-10 aspect-[16/9] max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-gray-100 shadow-2xl shadow-gray-900/10 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/30">
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt}
            fill
            priority
            unoptimized
            className="object-cover"
            sizes="(min-width: 1024px) 960px, 100vw"
          />
        </div>
      </div>
    </header>
  );
}
