import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { slugify } from "@/lib/utils";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  authorTitle: string;
  category: string;
  tags: string[];
  featuredImage: string;
  featuredImageAlt: string;
  readingTime: number;
  featured: boolean;
  content: string;
}

type Frontmatter = Omit<BlogPost, "content" | "readingTime"> & {
  readingTime?: number;
};

function readPostFile(fileName: string): BlogPost {
  const fullPath = path.join(BLOG_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as Frontmatter;
  const fallbackSlug = fileName.replace(/\.mdx$/, "");

  return {
    slug: frontmatter.slug ?? fallbackSlug,
    title: frontmatter.title,
    description: frontmatter.description,
    publishedAt: frontmatter.publishedAt,
    updatedAt: frontmatter.updatedAt,
    author: frontmatter.author ?? "FastFulfill Team",
    authorTitle: frontmatter.authorTitle ?? "Sourcing and Fulfillment Team",
    category: frontmatter.category,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    featuredImage: frontmatter.featuredImage,
    featuredImageAlt: frontmatter.featuredImageAlt ?? frontmatter.title,
    readingTime: frontmatter.readingTime ?? Math.ceil(readingTime(content).minutes),
    featured: Boolean(frontmatter.featured),
    content,
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map(readPostFile)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.category === category);
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

export async function getPostsByTagSlug(tagSlug: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.tags.some((tag) => slugify(tag) === tagSlug));
}

export async function getAllCategories(): Promise<
  { name: string; count: number }[]
> {
  const posts = await getAllPosts();
  const counts = new Map<string, number>();

  posts.forEach((post) => {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAllTags(): Promise<
  { name: string; slug: string; count: number }[]
> {
  const posts = await getAllPosts();
  const counts = new Map<string, { name: string; count: number }>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      const tagSlug = slugify(tag);
      const current = counts.get(tagSlug);
      counts.set(tagSlug, {
        name: current?.name ?? tag,
        count: (current?.count ?? 0) + 1,
      });
    });
  });

  return Array.from(counts.entries())
    .map(([slug, value]) => ({ slug, name: value.name, count: value.count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRelatedPosts(
  currentSlug: string,
  category: string,
  limit = 3
): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts
    .filter((post) => post.slug !== currentSlug && post.category === category)
    .slice(0, limit);
}

export function formatBlogCategory(category: string): string {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
