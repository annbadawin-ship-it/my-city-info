import { MetadataRoute } from "next";
import { getSortedPostsData } from "@/lib/posts";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 실제 배포 도메인 주소 (Cloudflare Pages 기준)
  const baseUrl = "https://my-city-info-dov.pages.dev";

  // 1. 기본 페이지들
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
  ];

  // 2. 모든 블로그 포스트들 자동 수집
  const posts = getSortedPostsData();
  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date || new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...routes, ...postRoutes];
}
