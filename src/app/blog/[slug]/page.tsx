import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostData, getSortedPostsData } from "@/lib/posts";
import { Metadata } from "next";
import React from "react";
import fs from "fs";
import path from "path";

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

  // city-info.json 과 본문 내용에서 실시간으로 원본 링크(정부24 상세주소)를 찾아내기
  let originalLink = "";
  try {
    const jsonPath = path.join(process.cwd(), "public/data/city-info.json");
    if (fs.existsSync(jsonPath)) {
      const fileContents = fs.readFileSync(jsonPath, "utf8");
      const cityInfo = JSON.parse(fileContents);
      // 포스트 제목에 매칭되거나 요약에 포함된 항목 찾기
      const matchedItem = cityInfo.find((item: any) => 
        post.title.includes(item.name) || 
        (item.name && post.summary.includes(item.name))
      );
      if (matchedItem && matchedItem.link && matchedItem.link !== "#") {
        originalLink = matchedItem.link;
      }
    }
  } catch (e) {
    console.error("원본 링크 연동 중 에러:", e);
  }

  // 매칭되는 항목이 없으면 본문 마크다운 텍스트에서 괄호 안의 URL 주소 추출
  if (!originalLink) {
    const linkMatch = post.content.match(/\[[^\]]+\]\((https?:\/\/[^\)]+)\)/);
    if (linkMatch && linkMatch[1]) {
      originalLink = linkMatch[1];
    }
  }

  // 최종 대체값 설정
  if (!originalLink) {
    originalLink = "https://www.gov.kr";
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
                  
                  // 3. 첫째, 둘째, 셋째 문단 후 아래 빈 간격 넣기 (둘째/셋째 위 간격 축소를 위해 my-4 적용)
                  if (/^(첫째|둘째|셋째)/.test(textContent.trim())) {
                    return (
                      <p className="my-4 text-base" {...props}>
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
                  // 상세 안내 및 신청 링크 문구 내의 a 태그 폰도 함께 3포인트 크게, 볼드 표기
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
                },
                hr: ({ node, ...props }) => {
                  // 1) 가로줄과 아래 타이틀과의 간격 띄우기 (mb-12 적용)
                  return <hr className="mt-8 mb-12 border-t border-slate-200" {...props} />;
                },
                h3: ({ node, children, ...props }) => {
                  // 2) 타이틀: 검정-볼드, 아래 문단과 간격 띄우기 (text-black font-extrabold mt-10 mb-6)
                  return (
                    <h3 className="text-xl sm:text-2xl font-extrabold text-black mt-10 mb-6" {...props}>
                      {children}
                    </h3>
                  );
                },
                li: ({ node, children, ...props }) => {
                  // 4) 지원대상 확인/서류준비/온라인 확인/신청 링크 등 리스트 항목 위 아래 간격 추가
                  return (
                    <li className="my-4 text-base leading-relaxed" {...props}>
                      {children}
                    </li>
                  );
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* AI 생성 안내 및 출처 링크 추가 */}
          <div className="mt-12 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-xs sm:text-sm text-slate-600 space-y-2">
            <p>💡 이 글은 공공데이터포털(data.go.kr)의 정보를 바탕으로 작성하였습니다. 정확한 내용은 원문 링크를 통해 확인해주세요.</p>
            {post.slug && (
              <div className="pt-2 border-t border-amber-100/60 flex items-center gap-1">
                <span className="font-bold text-slate-700">🔗 원문 출처: </span>
                <a 
                  href={originalLink}
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
