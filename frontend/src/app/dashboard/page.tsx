'use client';

import { useAuth } from '@/components/AuthContext';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { MoreHorizontal, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchLectureHistory,
  type LectureHistoryItem,
  updateLectureName,
  deleteLecture,             
} from '@/lib/api/lectures';
import {
  getFolders,
  moveLectureToFolder,           
  type FolderDto,
} from '@/lib/api/folders';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const searchParams = useSearchParams();

  // ── 폴더 필터 (쿼리에서 읽기 → 숫자로 파싱)
  const rawFolderId = searchParams.get('folderId');
  const folderId = useMemo(() => {
    if (!rawFolderId) return undefined;
    const n = Number(rawFolderId);
    return Number.isNaN(n) ? undefined : n;
  }, [rawFolderId]);

  // ── 목록 상태
  const [items, setItems] = useState<LectureHistoryItem[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);  // 강제 재조회 키



  const SHOW_PROMOS = false;
  const isFolderView = folderId !== undefined;



  // ── 검색어 디바운스
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  // 폴더가 바뀌면 1페이지로
  useEffect(() => { setPage(0); }, [folderId]);

  const handleStartLecture = () => router.push('/home');

  // ── ⋯ 메뉴/이름변경/폴더이동 상태
  const [menuFor, setMenuFor] = useState<number | null>(null); // lectureId
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [folderList, setFolderList] = useState<FolderDto[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const close = () => setMenuFor(null);
    if (menuFor != null) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuFor]);

  // ── 목록 API 호출
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    fetchLectureHistory({
      page,
      size,
      q: search || undefined,
      folderId,
      withAnno: false,
    })
      .then((res) => {
        if (!alive) return;
        setItems(res.items || []);
        setTotalPages(res.totalPages ?? 0);
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e.message || '불러오기 실패');
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [page, size, search, folderId, refreshKey]);

  // 날짜 포맷터
  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    []
  );

  // tags: "예제,문제,하하" | string[] | undefined 모두 처리
const tagsOf = (it: LectureHistoryItem): string[] => {
  const raw: any = (it as any).tags;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
  if (typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
};

// 프리뷰는 이제 태그 대신 파일명으로만 폴백
const previewOf = (it: LectureHistoryItem) =>
  it.summary?.trim()?.length ? it.summary : it.file.fileName;



  const folderBadgeStyles = [
    'bg-blue-50 text-blue-600 border-blue-100',
    'bg-purple-50 text-purple-600 border-purple-100',
    'bg-amber-50 text-amber-600 border-amber-100',
  ];

  const promotionalCards = [ { title: '실시간 STT로 강의를 놓치지 마세요', description: '말하는 속도를 따라가는 실시간 음성인식', icon: '/dashboard/microphone.png', bgColor: 'bg-blue-50', iconColor: 'text-blue-600', }, { title: 'AI 요약으로 핵심만 빠르게 파악하세요', description: 'GPT 기반 자동 요약과 주석 생성', icon: '/dashboard/AI-sparkle.png', bgColor: 'bg-purple-50', iconColor: 'text-purple-600', }, { title: '모르는 개념은 AI가 자동으로 설명해드려요', description: 'RAG 기반 실시간 개념 보강 시스템', icon: '/dashboard/hand-wave.png', bgColor: 'bg-amber-50', iconColor: 'text-amber-600', }, ]; const usefulFeatures = [ { title: '실시간 음성인식 (STT)', icon: '🔊' }, { title: 'AI 자동 요약 생성', icon: '📄' }, { title: '개념 자동 보강 설명', icon: '📚' }, { title: 'PDF 슬라이드 연동', icon: '🎵' }, { title: '세션별 복습 기능', icon: '▶️' }, ];
  // 홈(history)로 이동
  const goHistory = (fileId: number | string, version?: number | string) => {
    const v = version !== undefined && version !== '' ? `&version=${version}` : '';
    router.push(`/home?mode=history&fileId=${fileId}${v}`);
  };

  const dateLabelOf = (it: LectureHistoryItem) => {
    try { return fmt.format(new Date(it.updatedAt)); } catch { return ''; }
  };

  // ── 액션: 이름 변경
  const startRename = (it: LectureHistoryItem) => {
    console.log("함수시작")
    setMenuFor(null);
    setRenamingId(it.lectureId);
    setRenameValue(it.lectureName || it.file.fileName || '');
  };
  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };
  const commitRename = async () => {
    if (renamingId == null) return;
    const name = renameValue.trim();
    if (!name) { cancelRename(); return; }
    if (name.length > 20) { alert('강의명은 최대 20자입니다.'); return; }

    try {
      await updateLectureName(renamingId, name);
      setRefreshKey((k) => k + 1); // 새로고침
    } catch (e: any) {
      // 만약 백엔드에 강의명 변경 API가 아직 없다면,
      // 여기서 파일명 변경 API로 대체해도 됨 (renameFileName(it.file.id, name))
      alert(e?.message || '강의 이름 변경 실패');
    } finally {
      cancelRename();
    }
  };


// 강의 삭제
const handleLectureDelete = async (lectureId: number) => {
  // 안전장치(확인 팝업)
  const ok = window.confirm('삭제 후에는 복구할 수 없습니다.');
  if (!ok) return;

  try {
    await deleteLecture(lectureId);

    // 현재 페이지에서 마지막 1개를 지웠다면 이전 페이지로 한 칸 이동
    setRefreshKey((k) => k + 1);
    setMenuFor(null);
    setItems((prev) => prev.filter((x) => x.lectureId !== lectureId));
    if (items.length === 1 && page > 0) {
      setPage((p) => Math.max(0, p - 1));
    }
  } catch (e: any) {
    alert(e?.message || '강의 삭제 실패');
  }
};
  

  // ── 액션: 폴더 이동
  const openMoveFolder = async () => {
    setFoldersLoading(true);
    try {
      const list = await getFolders();
      setFolderList(list);
    } catch (e: any) {
      alert(e?.message || '폴더 목록 불러오기 실패');
    } finally {
      setFoldersLoading(false);
    }
  };
  const doMoveFolder = async (lectureId: number, targetFolderId: number) => {
    try {
      console.log("11",lectureId)
      await moveLectureToFolder(lectureId, targetFolderId);
      setMenuFor(null);
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      alert(e?.message || '폴더 이동 실패');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-900">강의 관리</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>홈</span>
                  <span>/</span>
                  <span>대시보드</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="강의 검색"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A8C7FA]"
                  />
                </div>
                <button
                  onClick={handleStartLecture}
                  className="bg-[#A8C7FA] hover:bg-[#8bb3f7] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  강의 녹음 시작
                </button>
              </div>
            </div>
          </header>

          <div className="p-6">
          {!isFolderView && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {promotionalCards.map((card, index) => (
                <div
                  key={index}
                  className={`${card.bgColor} border-0 p-6 rounded-lg relative overflow-hidden shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                        {card.title}
                      </h3>
                      <p className="text-xs text-gray-600">{card.description}</p>
                    </div>
                    <Image
                      src={card.icon}
                      alt="카드 아이콘"
                      width={42}
                      height={42}
                      className="w-[42px] h-[42px]"
                    />
                  </div>
                </div>
              ))}
            </div>
            )}
            <div className="space-y-0 bg-white rounded-lg border border-gray-200 shadow-sm">
              {loading && <div className="px-4 py-6 text-sm text-gray-500">불러오는 중…</div>}
              {err && !loading && <div className="px-4 py-6 text-sm text-rose-600">{err}</div>}
              {!loading && !err && items.length === 0 && (
                <div className="px-4 py-6 text-sm text-gray-500">최근 강의가 없습니다.</div>
              )}

{items.map((it, idx) => {
  const isRenaming = renamingId === it.lectureId;
  const isMenuOpen = menuFor === it.lectureId;

  return (
    <div key={it.lectureId} className="relative border-b border-gray-100 last:border-b-0">
      {/* ✅ 바깥 버튼 → div(role="button")로 변경 */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => goHistory(it.file.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goHistory(it.file.id);
          }
        }}
        className="w-full text-left flex items-start gap-3 px-4 py-5 hover:bg-[#A8C7FA]/10 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden bg-gray-50">
          <Image src="/file/notebook.png" alt="강의 아이콘" width={24} height={24}
                 className="w-full h-full object-cover rounded-full" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            {/* 제목 or 인라인 입력 */}
            {isRenaming ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') cancelRename();
                }}
                className="text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#A8C7FA]"
                placeholder="강의 이름"
                onClick={(e) => e.stopPropagation()}   // ✅ 부모 클릭 막기
              />
            ) : (
              <h3 className="font-medium text-gray-900 text-sm">
                {it.lectureName || it.file.fileName}
              </h3>
            )}

            <div className="flex items-center gap-1">
              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${folderBadgeStyles[idx % 3]}`}>
                {it.folder?.name ?? '기본'}
              </span>

              {/* ⋯ 버튼은 그대로 button 유지, 단 부모 클릭 막기 */}
              <button
                className="p-1 rounded hover:bg-gray-100"
                onMouseDown={(e) => e.stopPropagation()}   // ✅ 추가(권장)

                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const next = isMenuOpen ? null : it.lectureId;
                  setMenuFor(next);
                  if (next != null) openMoveFolder();
                }}
                aria-label="more"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="relative">
            <p className="text-sm text-gray-600 line-clamp-2 pr-24">
              {previewOf(it)}
            </p>
            {/* 🔽 태그 뱃지 (클릭해도 페이지 이동 안 되게 stopPropagation) */}
{tagsOf(it).length > 0 && isFolderView && (
  <div
    className="mt-1 flex flex-wrap gap-2 pr-24"
    onClick={(e) => e.stopPropagation()}
    onMouseDown={(e) => e.stopPropagation()}
  >
    {tagsOf(it).map((t) => (
      <span
        key={`${it.lectureId}-${t}`}
        className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
      >
        {t}
      </span>
    ))}
  </div>
)}
            <span className="absolute bottom-0 right-0 text-xs text-gray-500">
              {dateLabelOf(it)}
            </span>
          </div>
        </div>
      </div>

      {/* 드롭다운 메뉴 (바깥 div의 형제이므로 OK) */}
      {isMenuOpen && (
        <div
          className="absolute right-3 top-3 z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px]"
          onMouseDown={(e) => e.stopPropagation()} 
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
            onClick={() => startRename(it)}
          >
            강의 이름 변경
          </button>

          <button
  className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
  onMouseDown={(e) => e.stopPropagation()} // 부모 클릭 막기
  onClick={() => handleLectureDelete(it.lectureId)}
>
  강의 삭제
</button>

<div className="border-t border-gray-100" />

          <div className="border-t border-gray-100" />

          <div className="max-h-56 overflow-auto">
            <div className="px-3 py-2 text-xs text-gray-400">폴더 이동</div>
            {foldersLoading && <div className="px-3 pb-2 text-xs text-gray-400">불러오는 중…</div>}
            {folderList.map((f) => (
              <button
                key={f.folderId}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => doMoveFolder(it.lectureId, f.folderId)}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
})}

            </div>

            {/* 페이지네이션 그대로 */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 text-sm border rounded disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-sm text-gray-600 self-center">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm border rounded disabled:opacity-40"
              >
                다음
              </button>
            </div>
          </div>
        </main>

        {/* 오른쪽 패널 그대로 */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="space-y-6">
          <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">2025.9</h2>
                <div className="flex items-center gap-2">
                  <button className="p-1 text-[#A8C7FA] hover:bg-[#A8C7FA]/10 rounded">
                    <span className="text-sm">‹</span>
                  </button>
                  <button className="p-1 text-[#A8C7FA] hover:bg-[#A8C7FA]/10 rounded">
                    <span className="text-sm">›</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                <div>일</div>
                <div>월</div>
                <div>화</div>
                <div>수</div>
                <div>목</div>
                <div>금</div>
                <div>토</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 6 + 1;
                  const isCurrentMonth = day > 0 && day <= 30;
                  const isToday = day === 7;
                  return (
                    <div
                      key={i}
                      className={`h-8 flex items-center justify-center rounded ${
                        isToday
                          ? "bg-[#A8C7FA] text-white"
                          : isCurrentMonth
                            ? "text-gray-900 hover:bg-[#A8C7FA]/10"
                            : "text-gray-300"
                      }`}
                    >
                      {isCurrentMonth ? day : ""}
                    </div>
                  );
                })}
              </div>
            </div>            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Speak Note 핵심 기능</h3>
              <div className="space-y-3">
                {usefulFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-[#A8C7FA]">{feature.icon}</span>
                    <span>{feature.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto pt-6">
              <div className="bg-gradient-to-br from-[#A8C7FA]/10 to-[#A8C7FA]/5 rounded-lg p-4 text-center border border-[#A8C7FA]/20">
                <div className="text-sm text-gray-600 mb-2">새로운 강의</div>
                <div className="text-sm text-gray-600">녹음하는 방법</div>
                <div className="mt-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#A8C7FA]/20 to-[#A8C7FA]/10 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-2xl text-[#A8C7FA]">🎤</span>
                  </div>
                </div>
              </div>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
}
