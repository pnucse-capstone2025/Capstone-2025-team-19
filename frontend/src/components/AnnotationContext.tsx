//annotationContext 파일임
"use client";

import React, { createContext, useContext, useState } from "react";

interface Annotation {
  id: string;
  text: string;
  markdown?: string | null;
  answerState?: number; //새로 적용
  pageNumber?: number;
}

interface AnnotationContextType {
  annotations: Annotation[];
  addAnnotation: (a: Annotation) => void;
  editAnnotation: (id: string, newText: string) => void;
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>; 
}

const AnnotationContext = createContext<AnnotationContextType | null>(null);

export function AnnotationProvider({ children }: { children: React.ReactNode }) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const addAnnotation = (a: Annotation) => {
    try {
      const parsed = JSON.parse(a.text);
      
      const audioText = parsed.audioText || "";
      const annotation = parsed.annotation || "";
      const page = parsed.page || 1;
      const answerState = parsed.answerState ?? 1;
      
      console.log("서버 주석 수신:", { audioText, annotation, page, answerState });
      
      const newAnnotations: Annotation[] = [];
      
      // 1. audioText는 "음성" 주석으로 추가 (회색, answerState=2)
      if (audioText.trim()) {
        newAnnotations.push({
          id: `${a.id}-audio`,
          text: JSON.stringify({ 
            refinedText: audioText,
            source: "음성"
          }),
          markdown: a.markdown ?? null,
          answerState: 2,
          pageNumber: page,
        });
      }

      // 2. annotation은 answerState에 따라 "자료기반" 또는 "외부검색" 주석으로 추가
      if (annotation.trim()) {
        const paragraphs: string[] = annotation
          .split(/\n\s*\n/)
          .map((para: string) => para.trim())
          .filter(Boolean);
          
        if (paragraphs.length > 0) {
          // answerState에 따른 주석 타입 결정
          const annotationType = answerState === 1 ? "외부검색" : "자료기반";
          
          newAnnotations.push(
            ...paragraphs.map((para, idx) => ({
              id: `${a.id}-anno-${idx}`,
              text: JSON.stringify({ 
                refinedText: para,
                source: annotationType
              }),
              markdown: a.markdown ?? null,
              answerState: answerState,
              pageNumber: page,
            }))
          );
        }
      }

      // 실제 등록
      setAnnotations((prev) => [...prev, ...newAnnotations]);
    } catch (err) {
      console.error("🔴 JSON 파싱 실패. 원본 그대로 추가:", err);
      setAnnotations((prev) => [...prev, a]);
    }
  };
  
  
  

  const editAnnotation = (id: string, newText: string) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, text: newText } : a))
    );
  };

  return (
    <AnnotationContext.Provider
      value={{ annotations, addAnnotation, editAnnotation, setAnnotations }} 
    >
      {children}
    </AnnotationContext.Provider>
  );
}

export const useAnnotation = () => {
  const context = useContext(AnnotationContext);
  if (!context)
    throw new Error("useAnnotation must be used within AnnotationProvider");
  return context;
};
