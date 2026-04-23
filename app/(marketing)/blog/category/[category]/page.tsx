import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryFilter } from "@/components/blog/category-filter";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import {
  formatBlogCategory,
  getAllCategories,
  getPostsByCategory,
} from "@/lib/blog";
import { buildBreadcrumbJsonLd, buildMetadata, buildWebPageJsonLd } from "@/lib/seo";

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ category: category.name }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const label = formatBlogCategory(category);

  return buildMetadata({
    title: `${label} Articles`,
    description: `FastFulfill articles about ${label.toLowerCase()}.`,
    path: `/blog/category/${category}`,
  });
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const [posts, categories] = await Promise.all([
    getPostsByCategory(category),
    getAllCategories(),
  ]);

  if (posts.length === 0) notFound();

  return (
    <div className="bg-white dark:bg-gray-950">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: `${formatBlogCategory(category)} Articles`,
            description: `FastFulfill articles about ${formatBlogCategory(category).toLowerCase()}.`,
            path: `/blog/category/${category}`,
            type: "CollectionPage",
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: formatBlogCategory(category), path: `/blog/category/${category}` },
          ]),
        ]}
      />
      <section className="container-section py-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          Blog Category
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl">
          {formatBlogCategory(category)}
        </h1>
        <div className="mt-8">
          <CategoryFilter categories={categories} activeCategory={category} />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
