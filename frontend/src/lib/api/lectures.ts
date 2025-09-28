// lib/api/lectures.ts
export type LectureHistoryItem = {
    lectureId: number;
    lectureName: string;
    summary: string;
    tags: string[];
    language: string;
    startedAt: string | null;
    endedAt: string | null;
    durationMinutes: number | null;
    updatedAt: string;
    status: 'ACTIVE' | 'INACTIVE';
    folder: { id: number; name: string | null };
    file: { id: number; fileName: string; uuid: string };
  };
  
  export type PagedResponse<T> = {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: T[];
  };
  
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
  
  export function buildAuthHeaders(): Record<string, string> {
    // 이미 쓰는 방식이 있다면 이 함수 제거하고 기존 것을 import 해도 됨.
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }


export async function fetchHistory(params: {
  folderId?: number | string;
  q?: string;
  page?: number;
  size?: number;
  withAnno?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params.folderId) qs.set('folderId', String(params.folderId));
  if (params.q) qs.set('q', params.q);
  if (params.page != null) qs.set('page', String(params.page));
  if (params.size != null) qs.set('size', String(params.size));
  if (params.withAnno) qs.set('withAnno', 'true');

  const res = await fetch(`${API_BASE_URL}/api/lectures/history?${qs.toString()}`, {
    headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`history fetch failed: ${res.status}`);
  return res.json(); // { page, size, totalElements, items: [...] }
}

export async function updateLectureName(lectureId: number, name: string): Promise<void> {
  // 백엔드에서 엔드포인트 이름이 다르면 여기만 바꾸세요.
  console.log(name,lectureId)
  const res = await fetch(`${API_BASE_URL}/api/lectures/${lectureId}/name`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
    body: JSON.stringify({ name }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.isSuccess === false) {
    throw new Error(json?.message || `강의 이름 변경 실패: ${res.status}`);
  }
}

export async function deleteLecture(lectureId: number): Promise<void> {
  // 백엔드에서 엔드포인트 이름이 다르면 여기만 바꾸세요.
  console.log(lectureId)
  const res = await fetch(`${API_BASE_URL}/api/lectures/${lectureId}/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.isSuccess === false) {
    throw new Error(json?.message || `강의 삭제 실패: ${res.status}`);
  }
}
  
  export async function fetchLectureHistory(params: {
    page?: number;
    size?: number;
    q?: string;
    folderId?: number;
    status?: 'ACTIVE' | 'INACTIVE';
    from?: string; // ISO
    to?: string;   // ISO
    tags?: string[]; // ['ai','데이터베이스']
    withAnno?: boolean; // 백엔드에서 무시해도 OK
  }) {
    const q = new URLSearchParams();
    if (params.page != null) q.set('page', String(params.page));
    if (params.size != null) q.set('size', String(params.size));
    if (params.q) q.set('q', params.q);
    if (params.folderId != null) q.set('folderId', String(params.folderId));
    if (params.status) q.set('status', params.status);
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    if (params.tags?.length) params.tags.forEach(t => q.append('tags', t));
    if (params.withAnno) q.set('withAnno', 'true');
  
    const res = await fetch(
      `${API_BASE_URL}/api/lectures/history?${q.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        cache: 'no-store',
      }
    );
  
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `History fetch failed: ${res.status}`);
    }
    const json = (await res.json()) as PagedResponse<LectureHistoryItem>;
    return json;
  }
  