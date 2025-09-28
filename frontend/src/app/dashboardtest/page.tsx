'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from "@/components/AuthContext";

export default function DashboardTestPage() {
  const router = useRouter();
  const { user, signIn, signOut, isAuthenticated } = useAuth();

  // 수동 입력용
  const [fileIdInput, setFileIdInput] = useState<string>('');
  const [versionInput, setVersionInput] = useState<string>('');

  // 히스토리 페이지로 이동 (쿼리만 붙여서 기존 /home 로직 재사용)
  const goHistory = (fileId: number | string, version?: number | string) => {
    const v = version !== undefined && version !== '' ? `&version=${version}` : '';
    router.push(`/home?mode=history&fileId=${fileId}${v}`);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>대시보드(테스트)</h1>

      {/* 1) 하드코딩된 테스트 버튼들 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          onClick={() => goHistory(1)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
        >
          파일 #11 (최신)
        </button>
        <button
          onClick={() => goHistory(11, 3)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
        >
          파일 #11 (v3)
        </button>
        <button
          onClick={() => goHistory(42)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
        >
          파일 #42 (최신)
        </button>
      </div>

      {/* 2) 수동 입력 폼 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          placeholder="fileId"
          value={fileIdInput}
          onChange={(e) => setFileIdInput(e.target.value)}
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6, width: 160 }}
        />
        <input
          placeholder="version (선택)"
          value={versionInput}
          onChange={(e) => setVersionInput(e.target.value)}
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6, width: 160 }}
        />
        <button
          onClick={() => {
            if (!fileIdInput.trim()) {
              alert('fileId를 입력하세요');
              return;
            }
            goHistory(fileIdInput.trim(), versionInput.trim());
          }}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
        >
          이동
        </button>
      </div>

      <p style={{ color: '#666', marginTop: 12 }}>
        * 버튼/이동 시 <code>/home?mode=history&fileId=...(&version=...)</code> 로 이동합니다.
        <br />
        * /home 페이지의 히스토리 모드 이펙트가 백엔드에서 주석+파일URL을 불러와 복원합니다.
      </p>
    </div>
  );
}
