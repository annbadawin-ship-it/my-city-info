import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "성남시 생활 정보 | 행사·혜택·지원금 안내",
  description: "성남시 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
  openGraph: {
    title: "성남시 생활 정보 | 행사·혜택·지원금 안내",
    description: "성남시 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "성남시 생활 정보",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "성남시 생활 정보",
    "url": "https://my-city-info-dov.pages.dev",
    "description": "성남시 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "홈",
        "item": "https://my-city-info-dov.pages.dev",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "블로그",
        "item": "https://my-city-info-dov.pages.dev/blog",
      }
    ],
  };

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-amber-50/20 text-slate-800">{children}</body>
    </html>
  );
}
