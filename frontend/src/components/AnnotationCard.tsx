"use client";

import React, { forwardRef } from "react";
import Image from "next/image";
import MarkdownRenderer from "./MarkdownRenderer";
import pencil2 from "@/components/image/pencli2.svg";
import trash from "@/components/image/trash.svg";

interface AnnotationCardProps {
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

const AnnotationCard = forwardRef<HTMLTextAreaElement, AnnotationCardProps>(
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
        className="self-stretch relative rounded-lg shadow border border-gray-200 px-3 py-3"
        style={{ backgroundColor: "#FEECEA" }}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        {/* 상단 라벨 + 아이콘 */}
        <div className="flex items-center justify-between mb-2">
          <div className="rounded px-2 py-1 flex items-center" style={{ backgroundColor: "#FF7262" }}>
            <span className="text-white text-xs font-semibold">📕 자료 기반</span>
          </div>
          <div className="flex items-center gap-2">
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
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-1 mb-3 text-black text-sm leading-snug">
          {isEditing ? (
            <textarea
              ref={ref} // ✅ 부모에서 넘긴 ref 연결
              value={editValue}
              onChange={onEditChange}
              onBlur={onEditFinish}
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

        {/* 하단 정보 */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">{page}</span>
        </div>
      </div>
    );
  }
);

// ✅ forwardRef 쓰면 반드시 displayName 지정해주는 게 좋음
AnnotationCard.displayName = "AnnotationCard";
export default AnnotationCard;