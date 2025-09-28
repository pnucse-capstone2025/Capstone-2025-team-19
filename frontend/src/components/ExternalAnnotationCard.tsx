"use client";

import React, { forwardRef } from "react";
import Image from "next/image";
import MarkdownRenderer from "./MarkdownRenderer";
import pencil2 from "@/components/image/pencli2.svg";
import trash from "@/components/image/trash.svg";

interface ExternalAnnotationCardProps {
  content: string[];
  time?: string;
  page?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEditFinish?: () => void;
}

// ✅ forwardRef 적용
const ExternalAnnotationCard = forwardRef<HTMLTextAreaElement, ExternalAnnotationCardProps>(
  (
    {
      content,
      time,
      page,
      draggable,
      onDragStart,
      onEditClick,
      onDeleteClick,
      isEditing = false,
      editValue = "",
      onEditChange,
      onEditFinish,
    },
    ref
  ) => {
    return (
      <div
        className="self-stretch relative bg-blue-50 rounded-lg shadow border border-gray-200 px-3 py-3"
        style={{ backgroundColor: "#EFF6FF" }}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        {/* 상단 라벨 */}
        <div
          className="absolute left-3 top-3 bg-blue-400 rounded px-2 py-1 flex items-center z-10"
          style={{ backgroundColor: "#60A5FA" }}
        >
          <span className="text-white text-xs font-semibold">🔍 외부 검색</span>
        </div>

        {/* 아이콘 버튼들 */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          {onEditClick && (
            <button onClick={onEditClick}>
              <Image src={pencil2} alt="수정" width={16} height={16} />
            </button>
          )}
          {onDeleteClick && (
            <button onClick={onDeleteClick}>
              <Image src={trash} alt="삭제" width={16} height={16} />
            </button>
          )}
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-1 mb-3 mt-8 text-black text-sm leading-snug">
          {isEditing ? (
            <textarea
              value={editValue}
              onChange={onEditChange}
              onBlur={onEditFinish}
              ref={ref} // ✅ ref 연결
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onEditFinish?.();
                }
              }}
              rows={3}
              autoFocus
              className="w-full bg-white border border-gray-300 p-2 text-sm rounded resize-none"
            />
          ) : (
            <MarkdownRenderer
              markdown={content.join("\n")}
              className="[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5"
            />
          )}
        </div>

        {/* 하단 */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">{page}</span>
          <span className="text-gray-500 text-xs">{time}</span>
        </div>
      </div>
    );
  }
);

ExternalAnnotationCard.displayName = "ExternalAnnotationCard";
export default ExternalAnnotationCard;