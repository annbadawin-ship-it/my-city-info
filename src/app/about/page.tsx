import Link from "next/link";

export const metadata = {
  title: "사이트 소개 | 성남시 생활 정보",
  description: "성남시 생활 정보 블로그의 운영 목적과 데이터 출처 및 제작 방식을 안내합니다.",
};

export default function AboutPage() {
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
              className="text-amber-100 hover:text-white font-medium transition"
            >
              블로그
            </Link>
            <Link
              href="/about"
              className="text-white border-b-2 border-white pb-0.5 font-bold transition"
            >
              소개
            </Link>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 sm:py-16">
        <article className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-12 space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              서비스 소개
            </h2>
            <p className="text-sm text-slate-500">성남시 생활 정보 서비스의 투명성과 운영 방침을 안내해 드립니다.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>🎯</span> 운영 목적
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              이 서비스는 성남시민 및 지역 방문객분들에게 꼭 필요한 유용한 생활 밀착형 혜택 정보와 흥미로운 행사/축제 소식을 한곳에서 편리하게 확인하실 수 있도록 돕기 위해 운영되고 있습니다. 정보 탐색 비용을 줄이고, 나에게 맞는 혜택을 놓치지 않도록 지원하는 것을 최우선 목표로 합니다.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>📊</span> 공공데이터 출처
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              저희가 가공하고 전달하는 주요 기본 정보는 대한민국 정부가 운영하는 공식 포털인 **공공데이터포털(data.go.kr)**의 오픈 API 데이터(행정안전부 주관 gov24 서비스 목록 등)를 기반으로 수집됩니다. 주기적으로 최신 국가 서비스 데이터를 확인해 반영합니다.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>🤖</span> 콘텐츠 생성 및 AI 기술 활용 방침
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              수집된 원본 공공데이터는 주민분들이 이해하기 쉽도록 친근하고 가독성 높은 한국어 문장으로 자동 가공됩니다. 이 과정에서 **Generative AI 기술(Google Gemini)**을 사용하여 본문 초안을 작성 및 정리하고 있습니다.
            </p>
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/70 text-xs sm:text-sm text-amber-800">
              ⚠️ <strong>주의사항:</strong> AI 기술의 특성상 일시적으로 실제 정보와 세부 수치가 완벽히 일치하지 않는 현상이 발생할 수 있습니다. 각 정보 본문 하단에 제공되는 <strong>공식 원문 링크</strong>를 활용해 신청 전 최종 조건을 반드시 다시 한번 확인하시기 바랍니다.
            </div>
          </div>
        </article>
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-800 text-slate-400 text-xs py-8 mt-16 border-t border-slate-700">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-300 mb-1">성남시 생활 정보</p>
            <p>데이터 출처: 공공데이터포털</p>
          </div>
          <div className="sm:text-right">
            <p>© {new Date().getFullYear()} 성남시 생활 정보. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
