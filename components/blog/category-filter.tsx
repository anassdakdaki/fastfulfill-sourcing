import Link from "next/link";
import { formatBlogCategory } from "@/lib/blog";

export function CategoryFilter({
  categories,
  activeCategory,
}: {
  categories: { name: string; count: number }[];
  activeCategory?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          !activeCategory
            ? "bg-brand-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        }`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/blog/category/${category.name}`}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            activeCategory === category.name
              ? "bg-brand-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          {formatBlogCategory(category.name)} ({category.count})
        </Link>
      ))}
    </div>
  );
}
