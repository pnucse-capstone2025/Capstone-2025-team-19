"use client";

import { useEffect, useRef, useState } from "react";
import { DroppedAnnotation } from "@/components/types";
import { Rnd } from "react-rnd";
import AnnotationCard from "@/components/AnnotationCard";
import ExternalAnnotationCard from "@/components/ExternalAnnotationCard";
import QAnnotationCard from "@/components/QuestionAnnotationCard";

interface Props {
  item: DroppedAnnotation;
  dropped: DroppedAnnotation[];
  setDropped: React.Dispatch<React.SetStateAction<DroppedAnnotation[]>>;
}

export default function AnnotationItem({ item, dropped, setDropped }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(() => {
    try {
      return JSON.parse(item.text).refinedText ?? "";
    } catch {
      return item.text;
    }
  });

  useEffect(() => {
    try {
      setEditValue(JSON.parse(item.text).refinedText ?? "");
    } catch {
      setEditValue(item.text);
    }
  }, [item.text]);

  const updateAnnotation = (
    id: string,
    updates: Partial<{
      x: number;
      y: number;
      width: number;
      height: number;
      text: string;
      answerState: number;
    }>
    ) => {
        console.log("[updateAnnotation 호출됨]", { id, updates });
      
        setDropped((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
        );
      };

  const handleDelete = () => {
    setDropped((prev) => prev.filter((a) => a.id !== item.id));
  };

  const handleConfirmEdit = () => {
    const el = textareaRef.current;
    if (!el) return;

    const refinedText = editValue;

    const lines = refinedText.split("\n").flatMap((line: string) => {
      const temp = document.createElement("div");
      temp.style.width = el.clientWidth + "px";
      temp.style.font = window.getComputedStyle(el).font;
      temp.style.lineHeight = window.getComputedStyle(el).lineHeight;
      temp.style.whiteSpace = "pre-wrap";
      temp.style.visibility = "hidden";
      temp.style.position = "absolute";
      temp.style.pointerEvents = "none";
      temp.style.zIndex = "-1";
      document.body.appendChild(temp);

      const words = line.split(" ");
      let currentLine = "";
      let result: string[] = [];

      for (let word of words) {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        temp.textContent = testLine;
        if (temp.scrollWidth > el.clientWidth) {
          result.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) result.push(currentLine);
      document.body.removeChild(temp);
      return result;
    });
    console.log("[handleConfirmEdit] updateAnnotation 호출!", {
        id: item.id,
        width: el.offsetWidth+50,
        height: el.scrollHeight+50,
        refinedText,
      });

    updateAnnotation(item.id, {
      text: JSON.stringify({
        refinedText,
        lines,
        answerState: item.answerState ?? 2,
      }),
      width: el.offsetWidth+50,
      height: el.scrollHeight + 50,
    });

    setIsEditing(false);
  };

  const getCardComponent = () => {
    let parsedText = "";
    try {
      parsedText = JSON.parse(item.text).refinedText;
    } catch {
      parsedText = item.text;
    }

    const commonProps = {
      content: parsedText.split("\n"),
      page: `p.${item.pageNumber}`,
      isEditing,
      editValue,
      onEditChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setEditValue(e.target.value),
      onEditFinish: handleConfirmEdit,
      onEditClick: () => setIsEditing(true),
      onDeleteClick: handleDelete,
    };

    switch (item.answerState) {
      case 0:
        return <AnnotationCard ref={textareaRef} {...commonProps} />;
      case 1:
        return <ExternalAnnotationCard ref={textareaRef} {...commonProps} />;
      case 2:
      default:
        return <QAnnotationCard ref={textareaRef} {...commonProps} />;
    }
  };

  return (
    <Rnd
      size={{
        width: item.width ?? 180,
        height: Math.max(item.height ?? 100, 100),
      }}
      position={{ x: item.x, y: item.y }}
      onDragStop={(e, d) => updateAnnotation(item.id, { x: d.x, y: d.y })}
      onResizeStop={(e, dir, ref, delta, pos) =>
        updateAnnotation(item.id, {
          width: ref.offsetWidth,
          height: Math.max(ref.scrollHeight, 100),
          x: pos.x,
          y: pos.y,
        })
      }
      bounds="parent"
      enableResizing={{ bottomRight: true, bottom: true, right: true }}
      className="absolute pointer-events-auto"
      cancel='[data-non-draggable="true"]'
      disableDragging={isEditing}
    >
      <div
        className="w-full h-full overflow-hidden"
        ref={containerRef}
        data-ann-id={item.id}
      >
        {getCardComponent()}
      </div>
    </Rnd>
  );
}
