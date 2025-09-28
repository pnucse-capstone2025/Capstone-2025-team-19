// lib/api/folders.ts
export type FolderDto = {
    folderId: number;
    name: string;
    basic?: boolean;                // 기본 폴더 여부(백엔드 응답에 있으면 사용)
    status?: 'ACTIVE' | 'INACTIVE';
  };
  
  type BaseResponse<T> = {
    isSuccess: boolean;
    code: string | number;
    message: string;
    result: T;
  };
  
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
  
  export function buildAuthHeaders(): Record<string, string> {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  
  /** 폴더 이동: lectureId를 path로, body { id: folderId } */
  export async function moveLectureToFolder(lectureId: number, folderId: number): Promise<void> {
    console.log("폴더이동:",lectureId,   folderId)
    const res = await fetch(`${API_BASE_URL}/api/folders/${lectureId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
      body: JSON.stringify({ id: folderId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.isSuccess === false) {
      throw new Error(json?.message || `폴더 이동 실패: ${res.status}`);
    }
  }
  
  export async function getFolders(): Promise<FolderDto[]> {
    const res = await fetch(`${API_BASE_URL}/api/folders`, {
      headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
      cache: 'no-store',
    });
    const json = (await res.json()) as BaseResponse<FolderDto[]>;
    if (!res.ok || !json?.isSuccess) {
      throw new Error(json?.message || `폴더 목록 조회 실패: ${res.status}`);
    }
    return json.result ?? [];
  }
  
  export async function createFolder(name: string): Promise<void> {
    const trimmed = name.trim();
  
    // 프런트에서 1차 검증(백엔드 검증과 동일)
    if (!trimmed) throw new Error('폴더명을 입력해주세요.');
    if (trimmed.length > 20) throw new Error('폴더명은 최대 20자입니다.');
  
    const res = await fetch(`${API_BASE_URL}/api/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
      // ✅ 백엔드 CreateFolderRequest(folderName) 규격
      body: JSON.stringify({ folderName: trimmed }),
    });
  
    const json = await res.json().catch(() => ({} as any));
  
    // BaseResponse 형태를 가정
    if (!res.ok || json?.isSuccess === false) {
      throw new Error(json?.message || `폴더 생성 실패: ${res.status}`);
    }
  }
  export async function updateFolderName(folderId: number, name: string) {
    const res = await fetch(`${API_BASE_URL}/api/folders/${folderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
      body: JSON.stringify({ name: name }),
    });
    const json = (await res.json()) as BaseResponse<void>;
    if (!res.ok || !json?.isSuccess) {
      throw new Error(json?.message || `폴더명 수정 실패: ${res.status}`);
    }
  }
  
  export async function deleteFolder(folderId: number) {
    const res = await fetch(`${API_BASE_URL}/api/folders/${folderId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
    });
    const json = (await res.json()) as BaseResponse<void>;
    if (!res.ok || !json?.isSuccess) {
      throw new Error(json?.message || `폴더 삭제 실패: ${res.status}`);
    }
  }
  