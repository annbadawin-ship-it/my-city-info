import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

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

// 빌드 타임에 모든 정적 경로 생성 (Cloudflare Pages 정적 빌드 대응)
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), "public/data/city-info.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const data: InfoItem[] = JSON.parse(fileContents);
  return data.map((item) => ({
    id: item.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InfoDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // JSON 파일에서 상세 정보 로드
  const filePath = path.join(process.cwd(), "public/data/city-info.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const data: InfoItem[] = JSON.parse(fileContents);
  
  const detail = data.find((item) => item.id === id);

  if (!detail) {
    notFound();
  }

  const isEvent = detail.category === "행사/축제";

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* 상단 헤더 */}
      <header className="bg-amber-500 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-amber-100 hover:text-white transition gap-1 mb-2">
            ← 성남시 생활 정보 홈으로
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
              isEvent ? "bg-amber-100 text-amber-800" : "bg-orange-100 text-orange-800"
            }`}>
              {detail.category}
            </span>
          </div>
        </div>
      </header>

      {/* 본문 영역 */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6 sm:p-10">
          {/* 제목 */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-6 sm:mb-8 leading-snug">
            {detail.name}
          </h2>

          {/* 주요 정보 요약 리스트 */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 flex flex-col gap-4 text-sm sm:text-base text-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-b border-slate-200/60 pb-3">
              <span className="font-bold text-slate-500 w-24 shrink-0">📆 진행 기간</span>
              <span className="font-semibold text-slate-800">
                {detail.startDate === detail.endDate
                  ? detail.startDate
                  : `${detail.startDate} ~ ${detail.endDate}`}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-b border-slate-200/60 pb-3">
              <span className="font-bold text-slate-500 w-24 shrink-0">
                {isEvent ? "📍 행사 장소" : "📍 신청 접수처"}
              </span>
              <span className="text-slate-800">{detail.place}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-bold text-slate-500 w-24 shrink-0">👥 지원 대상</span>
              <span className="text-slate-800">{detail.target}</span>
            </div>
          </div>

          {/* 상세 내용 */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block"></span>
              상세내용 안내
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line p-1">
              {detail.summary}
            </p>
          </div>

          {/* 하단 버튼 액션 그룹 */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
            <a
              href={detail.link}
              className={`flex-1 text-center font-bold py-3.5 rounded-2xl transition duration-200 text-white shadow-sm ${
                isEvent ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              자세히 보기 →
            </a>
            <Link
              href="/"
              className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition duration-200"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-800 text-slate-400 text-xs py-8 mt-16 border-t border-slate-700">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-300 mb-1">성남시 생활 정보</p>
            <p>데이터 출처: 공공데이터포털</p>
          </div>
          <div className="sm:text-right">
            <p>마지막 업데이트: 2026년 7월 23일</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
