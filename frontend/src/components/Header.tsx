// components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import STTRecorder from "@/components/STTRecorder";
import { Pencil, Check, X } from "lucide-react";
import { renameFileName } from "@/lib/api/files";
import { useRouter } from "next/navigation";

type HeaderProps = {
  fileId?: number | string | null;
  fileName?: string;
  onFileNameUpdated?: (newName: string) => void; // 부모가 쓸 수 있음(선택)
  isPdfReady?: boolean;
};

export default function Header({ fileId, fileName, onFileNameUpdated, isPdfReady = false }: HeaderProps) {
  const router = useRouter();

  // 화면에 보여줄 파일명은 로컬 상태로 관리 (낙관적 갱신용)
  const [displayName, setDisplayName] = useState(fileName ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(fileName ?? "");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 부모가 props를 나중에 업데이트할 수도 있으므로 동기화
  useEffect(() => {
    if (typeof fileName === "string") {
      setDisplayName(fileName);
      if (!isEditing) setNameInput(fileName);
    }
  }, [fileName, isEditing]);

  const canEdit = fileId !== null && fileId !== undefined && `${fileId}`.length > 0;

  async function saveName() {
    if (!canEdit) return;
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setErrorMsg("파일명을 입력해 주세요.");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      const data = await renameFileName(`${fileId}`, trimmed);
      const newName = data?.name ?? trimmed;

      // 1) 로컬 표시 이름 즉시 갱신 (낙관적)
      setDisplayName(newName);

      // 2) 부모에도 알려서 상위 상태/props 갱신 유도(있을 경우)
      onFileNameUpdated?.(newName);

      // 3) 서버 컴포넌트에서 props를 읽어오면 강제 새로고침으로 동기화 (선택)
      // router.refresh();

      setIsEditing(false);
    } catch (e: any) {
      setErrorMsg(e?.message || "파일명 변경 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit() {
    setNameInput(displayName); // 현재 표시값으로 에디터 시작
    setIsEditing(true);
  }

  function cancelEdit() {
    setNameInput(displayName); // 표시값으로 롤백
    setIsEditing(false);
    setErrorMsg(null);
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">강의 사용</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>홈</span>
            <span>/</span>
            <span>강의 사용</span>

            {(displayName || isEditing) && (
              <>
                <span>/</span>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <span className="text-gray-700 font-medium">{displayName}</span>
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                        onClick={startEdit}
                        disabled={!canEdit}
                        title={canEdit ? "파일명 수정" : "fileId가 없어 수정할 수 없어요"}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        className="border rounded px-2 py-1 text-sm"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveName();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        placeholder="새 파일명"
                        disabled={saving}
                      />
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                        onClick={saveName}
                        disabled={saving}
                        title="저장"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-gray-100 disabled={saving}"
                        onClick={cancelEdit}
                        title="취소"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <STTRecorder fileId={fileId} isPdfReady={isPdfReady} />
        </div>
      </div>

      {errorMsg && <div className="mt-2 text-sm text-red-600">{errorMsg}</div>}
    </header>
  );
}
