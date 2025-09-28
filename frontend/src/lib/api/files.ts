// lib/api/files.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  try {
    const { auth } = require("@/lib/auth");
    const token = auth.getAccessToken?.();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}
  return headers;
}

/** 파일명 변경 */
export async function renameFileName(fileId: number | string, newName: string) {
  const res = await fetch(`${API_BASE_URL}/api/files/${fileId}/name`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ name: newName }),
  });

  // 백엔드에서 { id, name, updatedAt } 형식으로 준다고 가정
  if (!res.ok) {
    // 서버가 텍스트/JSON 어느 걸 돌려줘도 안전하게 처리
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Rename failed: ${res.status}`);
  }
  return res.json().catch(() => ({}));
}
