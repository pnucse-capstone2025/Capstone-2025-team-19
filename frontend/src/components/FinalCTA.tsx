// components/FinalCTA.tsx
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-blue-400 text-white py-20 text-center">
      <div className="max-w-screen-md mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          지금 바로 시작하세요
        </h2>
        <p className="text-lg mb-8">
          음성으로 PDF에 주석을 다는 새로운 경험을 해보세요
        </p>
        <Link
          href="/home"
          className="inline-block bg-white text-blue-500 font-semibold text-lg px-8 py-3 rounded-full shadow hover:bg-slate-100 transition"
        >
          무료로 시작하기
        </Link>
      </div>
    </section>
  );
}
