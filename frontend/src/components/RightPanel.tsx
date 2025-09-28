"use client";

import { useEffect, useState } from "react";
import { useAnnotation } from "@/components/AnnotationContext";
import AnnotationPanel from "@/components/AnnotationPanel";
import { DroppedAnnotation } from "@/components/types";

interface RightPanelProps {
  dropped: DroppedAnnotation[];
  renderedSizes: Record<number, { width: number; height: number }>;
  pdfFile: File | null;
  pdfUrl?: string | null;
  // ✅ 파라미터 없이 호출하는 형태로 통일
  handleSaveWithAnnotations: () => Promise<void>;
  handleSaveAllAnnotations: () => Promise<void>;
}

export default function RightPanel({
  dropped,
  renderedSizes,
  pdfFile,
  handleSaveWithAnnotations,
  handleSaveAllAnnotations,
}: RightPanelProps) {
  const { annotations } = useAnnotation();
  const [annotationReceived, setAnnotationReceived] = useState(false);

  useEffect(() => {
    const handler = () => {
      setAnnotationReceived(true);
      setTimeout(() => setAnnotationReceived(false), 3000);
    };
    window.addEventListener("annotation-added", handler);
    return () => window.removeEventListener("annotation-added", handler);
  }, []);

  return (
    <div className="w-80 max-w-xs min-w-[16rem] bg-white border-l border-gray-200 flex flex-col h-full">
      {/* 상단 안내 */}
      <div className="h-20 flex flex-col justify-center px-4">
        <div className="text-gray-800 text-base font-semibold leading-normal">AI 생성 주석</div>
        <div className="text-gray-500 text-sm leading-tight">드래그하여 PDF에 배치하세요</div>
      </div>

      {/* 구분선 */}
      <div className="w-full h-[1.5px] bg-gray-200" />

      {/* 주석 리스트 */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnnotationPanel />
      </div>

      {/* 하단 상태 + 버튼 */}
      <div className="border-t border-gray-200 flex flex-col justify-end px-4 pb-4 pt-4 gap-2">
        <div className="flex flex-col items-start gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full opacity-75 ${
                annotationReceived ? "bg-green-400" : "bg-indigo-300"
              }`}
            />
            <div className="text-gray-600 text-sm leading-tight">
              {annotationReceived ? "AI 주석 생성됨" : "주석 생성 전"}
            </div>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              key={annotationReceived ? "filled" : "empty"}
              className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
                annotationReceived ? "bg-green-400 w-full" : "bg-indigo-300 w-1"
              }`}
            />
          </div>
        </div>

        {/* 다운로드(어노테이션 포함) */}
        <button
          className="w-full h-10 bg-indigo-500 hover:bg-indigo-600 rounded-lg flex items-center justify-center gap-2 text-white text-base transition"
          onClick={() => {
            // if (!pdfFile) {
            //   alert("PDF 파일을 먼저 업로드하세요.");
            //   return;
            // }
            handleSaveWithAnnotations();
          }}
        >
          다운로드 (어노테이션 포함)
        </button>

        {/* 저장하기(서버 스냅샷) */}
        <button
          onClick={handleSaveAllAnnotations}
          className="w-full h-10 border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-800 text-base transition"
        >
          저장하기 (서버)
        </button>
      </div>
    </div>
  );
}
