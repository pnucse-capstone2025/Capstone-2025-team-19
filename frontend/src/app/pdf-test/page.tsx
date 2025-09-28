"use client";

import { useEffect, useState } from "react";

interface Annotation {
  id: string;
  text: string;
}

export default function AnnotationsPage() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    const fetchAnnotations = async () => {
      const res = await fetch("http://localhost:9000/annotations");
      const data = await res.json();
      setAnnotations(data); // [{id, text}, {id, text}, ...]
    };

    fetchAnnotations();

    // 주기적으로 계속 불러오고 싶으면 인터벌도 가능
    // const interval = setInterval(fetchAnnotations, 3000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧠 AI 주석 목록</h1>
      <div className="flex flex-col gap-2">
        {annotations.map((anno) => (
          <div
            key={anno.id}
            className="bg-blue-100 rounded p-2 shadow text-sm"
          >
            {anno.text}
          </div>
        ))}
      </div>
    </div>
  );
}
