// 📄 PDFViewer.tsx - 좌측 썸네일 + 우측 본문 구조 + 드래그 앤 드롭 주석 기능 유지

"use client";

import { useState, useRef, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { DroppedAnnotation } from "@/components/types";
import AnnotationItem from "@/components/AnnotationItem";

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`;

interface Props {
  dropped: DroppedAnnotation[];
  setDropped: React.Dispatch<React.SetStateAction<DroppedAnnotation[]>>;
  file: File | null;
  containerWidth: number;
  setContainerWidth: (width: number) => void;
  setRenderedSizes: React.Dispatch<
    React.SetStateAction<Record<number, { width: number; height: number }>>
  >;
}

export default function PDFViewer({
  dropped,
  setDropped,
  file,
  containerWidth,
  setContainerWidth,
  setRenderedSizes,
}: Props) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 220); // 썸네일 영역 고려
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [setContainerWidth]);

  if (!file) {
    return (
      <div className="text-center text-gray-500 mt-20">PDF 파일을 업로드하세요</div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full flex bg-[#f9fafb]">
      {/* 왼쪽 썸네일 영역 */}
      <div className="w-[200px] overflow-y-auto border-r border-gray-200 bg-white py-4 px-2">
        <Document file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
          {Array.from(new Array(numPages), (_, i) => (
            <div
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`cursor-pointer mb-4 p-1 rounded border hover:border-gray-400 ${
                currentPage === i + 1 ? "border-blue-400" : "border-transparent"
              }`}
            >
              <Page pageNumber={i + 1} width={160} />
              <div className="text-center text-xs text-gray-500 mt-1">page {i + 1}</div>
            </div>
          ))}
        </Document>
      </div>

      {/* 본문 페이지 */}
      <div className="flex-1 overflow-y-auto flex justify-center px-4 py-6">
        <Document file={file}>
          <div
            id={`pdf-page-${currentPage}`}
            className="relative"
            style={{ width: containerWidth }}
            onDrop={(e) => {
              e.preventDefault();
              const data = e.dataTransfer.getData("text/plain");
              const parsed = JSON.parse(data);
              const bounding = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - bounding.left;
              const y = e.clientY - bounding.top;
              setDropped((prev) => [
                ...prev,
                {
                  ...parsed,
                  text: parsed.text ?? "",
                  x,
                  y,
                  height:
                  typeof parsed.height === "number" && parsed.height > 0
                    ? parsed.height + 24 // ✅ 드롭 시 하단 정보 여유 높이 확보
                    : 100,               // ✅ 최소 높이도 넉넉하게 보장
                  width: typeof parsed.width === "number" && parsed.width > 0 ? parsed.width : 180,                  
                  pageNumber: currentPage,
                  answerState: parsed.answerState ?? 1,
                },
              ]);
              const dropEvent = new CustomEvent("annotation-dropped", {
                detail: parsed.id,
              });
              window.dispatchEvent(dropEvent);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Page
              pageNumber={currentPage}
              width={containerWidth}
              scale={1.0}
              onRenderSuccess={() => {
                const el = document.getElementById(`pdf-page-${currentPage}`);
                if (el) {
                  const canvas = el.querySelector("canvas");
                  const textLayer = el.querySelector(".react-pdf__Page__textContent");
                  const annotationLayer = el.querySelector(".react-pdf__Page__annotations");
                  [canvas, textLayer, annotationLayer].forEach((layer) => {
                    if (layer instanceof HTMLElement) {
                      layer.style.pointerEvents = "none";
                    }
                  });
                  setRenderedSizes((prev) => ({
                    ...prev,
                    [currentPage]: {
                      width: el.clientWidth,
                      height: el.clientHeight,
                    },
                  }));
                }
              }}
            />

            {/* 주석 렌더링 */}
            {dropped
  .filter((item) => item.pageNumber === currentPage)
  .map((item) => (
    <AnnotationItem
      key={item.id}
      item={item}
      dropped={dropped}
      setDropped={setDropped}
    />
))}
          </div>
        </Document>
      </div>
    </div>
  );
}