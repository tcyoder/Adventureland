import { MetadataRoute } from "next";

const SITE_URL = "https://tomorrowlandlightandpower.co";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/login", "/reset-password"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
