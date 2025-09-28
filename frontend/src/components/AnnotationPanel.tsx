"use client";

import React, { useState, useEffect } from "react";
import { useAnnotation } from "@/components/AnnotationContext";
import AnnotationCard from "@/components/AnnotationCard";
import ExternalAnnotationCard from "@/components/ExternalAnnotationCard";
import QAnnotationCard from "@/components/QuestionAnnotationCard";

export default function AnnotationPanel() {
  const { annotations, editAnnotation, setAnnotations } = useAnnotation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (id: string, text: string) => {
    try {
      const parsed = JSON.parse(text);
      setEditValue(parsed.refinedText || "");
    } catch {
      setEditValue(text); // fallback
    }
    setEditingId(id);
  };

  const finishEdit = () => {
    if (editingId !== null) {
      editAnnotation(editingId, editValue);
      setEditingId(null);
      setEditValue("");
    }
  };

  const deleteAnnotation = (id: string) => {
    const newList = annotations.filter((a) => a.id !== id);
    setAnnotations(newList);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    const dragged = annotations.find((a) => a.id === id);
    if (!dragged) return;

    const target = e.currentTarget as HTMLElement;
    const width = target.offsetWidth;
    const height = target.offsetHeight;

    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        ...dragged,
        width,
        height,
        isDragged: true,
      })
    );
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    };

    window.addEventListener("annotation-dropped", handler);
    return () => window.removeEventListener("annotation-dropped", handler);
  }, [setAnnotations]);

  return (
    <div className="flex flex-col gap-4">
      {annotations.map((anno) => {
        const contentLines = (() => {
          try {
            return JSON.parse(anno.text).refinedText?.split("\n") ?? [anno.text];
          } catch {
            return [anno.text];
          }
        })();

        const time = ""; // 추후 필요 시 anno에 포함
        const page =
        typeof anno.pageNumber === "number" && isFinite(anno.pageNumber)
          ? `p.${anno.pageNumber}`
          : undefined;
      
        const commonProps = {
          content: contentLines,
          time,
          page,
          draggable: true,
          onDragStart: (e: React.DragEvent) => handleDragStart(e, anno.id),
          isEditing: editingId === anno.id,
          editValue,
          onEditClick: () => startEdit(anno.id, anno.text),
          onDeleteClick: () => deleteAnnotation(anno.id),
          onEditChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setEditValue(e.target.value),
          onEditFinish: finishEdit,
        };

        return (
          anno.answerState === 2 ? (
            <QAnnotationCard key={anno.id} {...commonProps} />
          ) : anno.answerState === 1 ? (
            <ExternalAnnotationCard key={anno.id} {...commonProps} />
          ) : (
            <AnnotationCard key={anno.id} {...commonProps} />
          )
        );
        
      })}
    </div>
  );
}
