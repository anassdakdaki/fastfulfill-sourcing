import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fastfulfill.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/supplier/", "/fulfillment/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
