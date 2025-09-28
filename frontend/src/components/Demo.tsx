"use client";

import Link from "next/link";
import { useState } from "react";

export default function Demo() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section id="demo" className="bg-white py-24 relative">
      <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* 텍스트 설명 */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
            실제 사용 예시
          </h2>
          <p className="text-slate-600 mb-4">
            말의 흐름 속에서 놓치기 쉬운 핵심, AI가 정리해드립니다.
          </p>
          <p className="text-slate-600 mb-4">
            사용자의 발화를 인식해, 그 안의 질문이나 의도를 파악해 문서와 연결된 응답 또는 주석을 생성합니다.
          </p>
          <ul className="text-slate-500 text-sm mb-6 space-y-2 list-none">
            <li>✓ 회의 중 발언 정리</li>
            <li>✓ 발표 중 즉석 질문 대응</li>
            <li>✓ 스터디/세미나에서 필기 대체</li>
            <li>✓ 문서 기반 질문 응답</li>
          </ul>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-full transition"
            >
              데모 영상 보기
            </button>
            <Link
              href="/home"
              className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-full transition"
            >
              데모 체험하기
            </Link>
          </div>
        </div>

        {/* 시각적 예시 박스 */}
        <div className="bg-slate-100 p-8 rounded-2xl border-2 border-dashed border-slate-300">
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <h4 className="text-slate-800 font-bold mb-1">📄 PDF 문서</h4>
            <p className="text-slate-500 text-sm">원본 문서 내용...</p>
          </div>
          <div className="bg-indigo-500 text-white p-4 rounded-lg shadow mb-4">
            <h4 className="font-bold mb-1">🎤 음성 입력</h4>
            <p className="text-sm opacity-90">"이 부분은 중요한 조항이니 강조해서 표시해주세요"</p>
          </div>
          <div className="bg-emerald-500 text-white p-4 rounded-lg shadow">
            <h4 className="font-bold mb-1">✏️ 생성된 주석</h4>
            <p className="text-sm opacity-90">중요 조항 - 계약 이행 시 반드시 준수해야 함</p>
          </div>
        </div>
      </div>

      {/* 모달 영상 */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-3xl w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ✕
            </button>
            <video
              controls
              autoPlay
              className="w-full h-auto"
            >
              <source src="/video/demo.mp4" type="video/mp4" />
              브라우저가 비디오를 지원하지 않습니다.
            </video>
          </div>
        </div>
      )}
    </section>
  );
}
