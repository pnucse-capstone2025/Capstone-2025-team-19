"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { ChevronRight, Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

type NoteItem = {
  id: string;
  title: string;
  tags: string[];
  duration: string;
  createdAt: string;
  inProgress?: boolean;
  icon: string;
};

const mockNotesByFolder: Record<string, NoteItem[]> = {
  database: [
    { id: "n1", title: "정규화 원리 정리", tags: ["정규화", "1NF", "RDB"], duration: "02:22:22", createdAt: "2025. 4. 30, 오전 11:06", icon: "notebook.png" },
    { id: "n2", title: "인덱스 설계와 활용", tags: ["인덱스", "쿼리"], duration: "00:59:09", createdAt: "2025. 4. 29, 오후 4:31", icon: "bookmark.png" },
  ],
  "ai-ml": [
    { id: "n3", title: "CNN 기본 개념", tags: ["딥러닝", "CNN"], duration: "02:38:07", createdAt: "2025. 3. 21, 오후 5:00", icon: "folder.png" },
    { id: "n4", title: "NLP 전처리", tags: ["토큰화", "정규화"], duration: "01:15:13", createdAt: "2025. 1. 25, 오후 3:43", inProgress: true, icon: "meno.png" },
  ],
  "web-dev": [
    { id: "n5", title: "React 성능 최적화", tags: ["React", "성능"], duration: "00:39:09", createdAt: "2025. 1. 23, 오후 5:33", icon: "spring-note.png" },
  ],
};

export default function FolderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const folderId = params.id;

  const notes = useMemo(() => mockNotesByFolder[folderId] ?? [], [folderId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-900">기본 폴더</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>홈</span>
                  <ChevronRight className="w-4 h-4" />
                  <span>폴더</span>
                </div>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색어를 입력해 주세요"
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A8C7FA]"
                />
              </div>
            </div>
          </header>

          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200">
              {notes.map((note) => (
                <div key={note.id} className="px-4 py-3 border-b last:border-b-0 border-gray-100 hover:bg-[#A8C7FA]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                      <Image
                        src={`/file/${note.icon}`}
                        alt="노트 아이콘"
                        width={24}
                        height={24}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">{note.title}</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {note.tags.map((t) => (
                          <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-6">
                    <span>{note.duration}</span>
                    <span>{note.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


