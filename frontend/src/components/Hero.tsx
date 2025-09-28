// components/Hero.tsx
import Link from 'next/link';
import AutoPlayVideo from "@/components/AutoPlayVideo";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-200 to-blue-50 text-slate-800 pt-32 pb-20 text-center relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
      <AutoPlayVideo />
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          말에 집중하세요, <br className="hidden sm:inline" />
          기록은 <span className="text-blue-500">AI가!</span>
        </h1>
        <p className="text-lg md:text-xl mb-8 text-slate-600">
          AI 기반 음성 인식과 문서 분석으로 실시간 기록과 주석을 더욱 효율적으로 관리하세요
        </p>
        <Link
          href="/home"
          className="inline-block bg-white text-blue-500 font-semibold text-lg px-8 py-3 rounded-full shadow hover:bg-gray-100 transition"
        >
          무료로 시작하기
        </Link>
      </div>
    </section>
  );
}
