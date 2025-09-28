"use client";

import Image from "next/image";
import PDF from "@/components/image/pdf.svg";

export default function UploadArea() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 gap-5 text-center text-gray-600">
      <Image src={PDF} alt="강의 사용" width={80} height={100} />
      <b className="text-xl text-gray-800">PDF를 업로드해주세요</b>
      <p className="text-sm text-gray-500">
        강의 자료를 드래그하거나 버튼을 클릭해주세요
      </p>

      {/* ✅ 업로드 버튼 */}
      <label
        htmlFor="pdf-upload"
        className="mt-2 px-6 py-2 text-white rounded hover:bg-indigo-700 cursor-pointer transition"
        style={{ backgroundColor: "#A8C7FA" }}
      >
        PDF 업로드
      </label>
    </div>
  );
}
