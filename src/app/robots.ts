import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dutch-ind.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/profile/",
          "/cart",
          "/checkout",
          "/order-success",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
