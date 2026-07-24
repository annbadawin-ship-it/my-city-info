import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function BlogListPage() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* 상단 헤더 */}
      <header className="bg-amber-500 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl" role="img" aria-label="city">
              🏡
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                <Link href="/" className="hover:text-amber-100 transition-colors">
                  성남시 생활 정보
                </Link>
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 mt-1">
                우리 동네의 유익하고 알찬 생활 소식을 실시간으로 전해드립니다.
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-amber-100 hover:text-white font-medium transition"
            >
              생활 정보 홈
            </Link>
            <Link
              href="/blog"
              className="text-white border-b-2 border-white pb-0.5 font-bold transition"
            >
              블로그
            </Link>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center gap-2 mb-8 border-b border-amber-200 pb-3">
          <span className="text-2xl" role="img" aria-label="blog">
            📝
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-amber-900">
            블로그 소식
          </h2>
          <span className="ml-2 text-xs bg-amber-100 text-amber-800 font-medium px-2.5 py-0.5 rounded-full">
            {posts.length}건
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <span className="text-4xl block mb-4" role="img" aria-label="empty">
              📭
            </span>
            <p className="text-slate-500 font-medium">등록된 블로그 글이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md">
                      {post.category || "일반"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {post.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 hover:text-amber-600 transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
                <div className="px-6 pb-6 pt-3 bg-slate-50/50 border-t border-slate-50 flex flex-col gap-2">
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-slate-200/60 text-slate-600 text-[10px] px-2 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block w-full text-center bg-orange-500 hover:bg-white text-white hover:text-orange-500 font-extrabold py-2.5 rounded-xl border border-transparent hover:border-orange-500 transition duration-200 shadow-sm text-sm"
                  >
                    더 읽어보기 →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-800 text-slate-400 text-xs py-8 mt-16 border-t border-slate-700">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-slate-300 mb-1">
              성남시 생활 정보
            </p>
            <p>데이터 출처: 공공데이터포털 (실제 데이터 연동 준비 중)</p>
          </div>
          <div className="text-center sm:text-right">
            <p>마지막 업데이트: 2026년 7월 23일</p>
            <p className="mt-1 text-slate-500">
              © {new Date().getFullYear()} 성남시 생활 정보. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
