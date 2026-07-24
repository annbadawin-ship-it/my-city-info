import Link from "next/link";
import fs from "fs";
import path from "path";

interface InfoItem {
  id: string;
  name: string;
  category: "행사/축제" | "지원금/혜택";
  startDate: string;
  endDate: string;
  place: string;
  target: string;
  summary: string;
  link: string;
}

function getLocalData(): InfoItem[] {
  const filePath = path.join(process.cwd(), "public/data/city-info.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
}

export default function Home() {
  const data = getLocalData();
  const events = data.filter((item) => item.category === "행사/축제");
  const benefits = data.filter((item) => item.category === "지원금/혜택");

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
                성남시 생활 정보
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 mt-1">
                우리 동네의 유익하고 알찬 생활 소식을 실시간으로 전해드립니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4 text-sm sm:text-base">
              <Link href="/" className="text-white border-b-2 border-white pb-0.5 font-bold transition">
                생활 정보 홈
              </Link>
              <Link href="/blog" className="text-amber-100 hover:text-white font-medium transition">
                블로그
              </Link>
            </nav>
            <div className="hidden md:flex gap-2">
              <span className="bg-amber-600/50 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition">
                #성남시소식
              </span>
              <span className="bg-amber-600/50 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition">
                #꿀정보
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* 섹션 1: 이번 달 행사/축제 */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6 border-b border-amber-200 pb-3">
            <span className="text-2xl" role="img" aria-label="festival">
              🎉
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-white">
              이번 달 행사 / 축제
            </h2>
            <span className="ml-2 text-xs bg-amber-100 text-amber-800 font-medium px-2.5 py-0.5 rounded-full">
              {events.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex flex-col gap-2 mb-3">
                    <span className="self-start bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md">
                      {event.category}
                    </span>
                    <span className="text-base font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 font-mono text-center sm:text-left">
                      {event.startDate === event.endDate
                        ? event.startDate
                        : `${event.startDate} ~ ${event.endDate}`}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 hover:text-amber-600 transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {event.summary}
                  </p>
                </div>
                <div className="px-6 pb-6 pt-3 bg-slate-50/50 border-t border-slate-50 flex flex-col gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-600 w-12 shrink-0">📍 장소</span>
                    <span className="truncate">{event.place}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-600 w-12 shrink-0">👥 대상</span>
                    <span className="truncate">{event.target}</span>
                  </div>
                  <Link
                    href="/blog"
                    className="mt-2 block w-full text-center bg-orange-500 hover:bg-white text-white hover:text-orange-500 font-extrabold py-2.5 rounded-xl border border-transparent hover:border-orange-500 transition duration-200 shadow-sm"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 섹션 2: 지원금/혜택 정보 */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-orange-200 pb-3">
            <span className="text-2xl" role="img" aria-label="money">
              💰
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-orange-950 dark:text-white">
              지원금 / 혜택 정보
            </h2>
            <span className="ml-2 text-xs bg-orange-100 text-orange-800 font-medium px-2.5 py-0.5 rounded-full">
              {benefits.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-1 rounded-md">
                      {benefit.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      연중상시
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 hover:text-orange-600 transition-colors">
                    {benefit.name}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {benefit.summary}
                  </p>
                </div>
                <div className="px-6 pb-6 pt-3 bg-slate-50/50 border-t border-slate-50 flex flex-col gap-2 text-xs text-slate-500">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-600 w-12 shrink-0">📍 접수처</span>
                    <span>{benefit.place}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-600 w-12 shrink-0">👥 대상</span>
                    <span>{benefit.target}</span>
                  </div>
                  <Link
                    href="/blog"
                    className="mt-2 block w-full text-center bg-orange-500 hover:bg-white text-white hover:text-orange-500 font-extrabold py-2.5 rounded-xl border border-transparent hover:border-orange-500 transition duration-200 shadow-sm"
                  >
                    신청 가이드 보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
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
