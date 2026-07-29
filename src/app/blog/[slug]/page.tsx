import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostData, getSortedPostsData } from "@/lib/posts";
import { Metadata } from "next";
import React from "react";

// React children에서 순수 텍스트만 추출하는 헬퍼 함수
function getTextContent(children: React.ReactNode): string {
  if (!children) return "";
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(getTextContent).join("");
  }
  if (typeof children === "object" && children !== null && "props" in children) {
    return getTextContent((children as any).props.children);
  }
  return "";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug);
  
  if (!post) {
    return {
      title: "포스트를 찾을 수 없습니다",
    };
  }

  return {
    title: `${post.title} | 성남시 생활 정보`,
    description: post.summary,
    openGraph: {
      title: `${post.title} | 성남시 생활 정보`,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      authors: ["성남시 생활 정보"],
    },
  };
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  if (posts.length === 0) {
    return [{ slug: "welcome" }];
  }
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    notFound();
  }

  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "datePublished": post.date,
    "description": post.summary,
    "author": {
      "@type": "Organization",
      "name": "성남시 생활 정보",
      "url": "https://my-city-info-dov.pages.dev"
    },
    "publisher": {
      "@type": "Organization",
      "name": "성남시 생활 정보",
      "logo": {
        "@type": "ImageObject",
        "url": "https://my-city-info-dov.pages.dev/favicon.ico"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
      />
      {/* 상단 헤더 */}
      <header className="bg-amber-500 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-base font-semibold text-amber-100 hover:text-white transition gap-1 mb-2"
          >
            ← 블로그 목록으로
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">
              {post.category || "블로그 소식"}
            </span>
            <span className="text-sm text-amber-100 font-mono">{post.date}</span>
          </div>
        </div>
      </header>

      {/* 본문 영역 */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6 sm:p-10">
          {/* 제목 */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-6 sm:mb-8 leading-snug">
            {post.title}
          </h2>

          {/* 태그 */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 마크다운 본문 */}
          <div className="prose prose-amber max-w-none text-slate-700 leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, children, ...props }) => {
                  const textContent = getTextContent(children);
                  
                  // 1. ◆ 타이틀 문구 : 폰트 사이즈 - 3포인트 크게, 볼드 표기 (text-xl 적용)
                  if (textContent.trim().startsWith("◆")) {
                    return (
                      <p className="text-xl font-bold text-slate-900 mt-8 mb-4" {...props}>
                        {children}
                      </p>
                    );
                  }
                  
                  // 2. 상세 안내 및 신청 링크 문구 : 폰트 사이즈 - 3포인트 크게, 볼드 표기, 컬러(주황색)로 표기
                  if (textContent.includes("상세 안내 및 신청 링크") || textContent.includes("신청 링크")) {
                    return (
                      <p className="text-xl font-extrabold text-orange-600 mt-8 mb-6" {...props}>
                        {children}
                      </p>
                    );
                  }
                  
                  // 3. 첫째, 둘째, 셋째 문단 후 아래 빈 간격 넣기 (mb-12 적용)
                  if (/^(첫째|둘째|셋째)/.test(textContent.trim())) {
                    return (
                      <p className="mb-12 text-base" {...props}>
                        {children}
                      </p>
                    );
                  }
                  
                  // 4. 일반 문단 사이 위/아래 빈 간격 넣기 (기본 mt-6 mb-6 으로 넓게 배치)
                  return (
                    <p className="my-6 text-base" {...props}>
                      {children}
                    </p>
                  );
                },
                a: ({ node, children, ...props }) => {
                  // 상세 안내 및 신청 링크 문구 내의 a 태그 폰트도 함께 3포인트 크게, 볼드 표기
                  return (
                    <a
                      className="text-xl font-extrabold text-orange-600 hover:text-orange-800 underline inline-block"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* AI 생성 안내 및 출처 링크 추가 */}
          <div className="mt-12 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-xs sm:text-sm text-slate-600 space-y-2">
            <p>💡 이 글은 공공데이터포털(data.go.kr)의 정보를 바탕으로 AI가 작성하였습니다. 정확한 내용은 원문 링크를 통해 확인해주세요.</p>
            {post.slug && (
              <div className="pt-2 border-t border-amber-100/60 flex items-center gap-1">
                <span className="font-bold text-slate-700">🔗 원문 출처: </span>
                <a 
                  href={
                    post.category === "행사/축제" || post.slug.includes("festival")
                      ? "https://www.gov.kr/portal/rcvfvrSvc/dtlEx/000000465790" // 기본 행사성 정보
                      : "https://www.gov.kr/portal/rcvfvrSvc/dtlEx/105100000001" // 기본 혜택성 정보
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:text-amber-900 underline font-medium text-xs sm:text-sm inline"
                >
                  공공데이터포털 바로가기
                </a>
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-12 border-t border-slate-100">
            <Link
              href="/blog"
              className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition duration-200"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </article>
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-800 text-slate-400 text-xs py-8 mt-16 border-t border-slate-700">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-300 mb-1">성남시 생활 정보</p>
            <p>데이터 출처: 공공데이터포털</p>
          </div>
          <div className="sm:text-right">
            <p>최종 업데이트: {post.date}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
