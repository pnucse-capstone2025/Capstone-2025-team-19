"use client";

import { useState, useEffect } from "react";
import { Folder, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import Image from "next/image";
import { getFolders, createFolder, updateFolderName, deleteFolder, type FolderDto } from '@/lib/api/folders';
import { fetchHistory } from '@/lib/api/lectures';
import { useSearchParams } from 'next/navigation';


interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const searchParams = useSearchParams();
  const folderIdParam = searchParams.get('folderId') ?? undefined;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [showCollapseButton, setShowCollapseButton] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [guestAvatar, setGuestAvatar] = useState<string>("");
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>("새로운 폴더");
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, isAuthenticated, loading, setUserFromTokens } = useAuth();
  const [menuId, setMenuId] = useState<number | null>(null);       // 컨텍스트 메뉴 (숫자 id 하나만)

  const [hoveredFolder, setHoveredFolder] = useState<number | null>(null);

  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [foldersError, setFoldersError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');


  const [histLoading, setHistLoading] = useState(false);
  const [histError, setHistError] = useState<string | null>(null);
  const [items, setItems] = useState<LectureHistoryItem[]>([]);


  type LectureHistoryItem = {
    lectureId: number;
    lectureName: string;
    summary: string;
    tags: string[];
    language: string;
    startedAt: string;
    endedAt: string;
    updatedAt: string;
    status: 'ACTIVE' | 'INACTIVE';
    folder: { id: number; name: string };
    file: { id: number; fileName: string; uuid: string };
  };
  
  type PagedResponse<T> = {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: T[];
  };
  // 프로필 이미지 설정
  useEffect(() => {
    // 로딩 중이면 프로필 설정하지 않음
    if (loading) return;

    const avatarImages = [
      "carrot.png", 
      "dolphin.png", 
      "duck.png", 
      "earth.png", 
      "fire.png", 
      "star.png", 
      "sunset.png", 
      "tree1.png", 
      "tree2.png", 
      "trophy.png"
    ];

    if (isAuthenticated && user?.id) {
      // 로그인한 사용자: ID 기반으로 고정된 이미지 선택
      const userIndex = user.id % avatarImages.length;
      setGuestAvatar(avatarImages[userIndex]);
    } else if (!isAuthenticated) {
      // 게스트: 랜덤 이미지 선택
      const randomIndex = Math.floor(Math.random() * avatarImages.length);
      setGuestAvatar(avatarImages[randomIndex]);
    }
  }, [isAuthenticated, user?.id, loading]);

  // 로그인 상태가 변경될 때 사용자 정보 다시 가져오기
  useEffect(() => {
    if (isAuthenticated && !user && !loading) {
      setUserFromTokens();
    }
  }, [isAuthenticated, user, loading, setUserFromTokens]);

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await signOut();
      router.push('/');
    } else {
      router.push('/auth/signin');
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };




  // 컨텍스트 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const close = () => setMenuId(null);
    if (menuId != null) document.addEventListener('click', close);   // ← click 사용
    return () => document.removeEventListener('click', close);
  }, [menuId]);
  
  

  type LectureItem = { id: string; name: string; status: string };
  type LectureFolder = { id: string; name: string; lectures: LectureItem[] };
  useEffect(() => {
    let alive = true;
    if (!isAuthenticated || loading) return;
  
    setFoldersLoading(true);
    setFoldersError(null);
    getFolders()
      .then((list) => alive && setFolders(list))
      .catch((e) => alive && setFoldersError(e.message || '폴더 조회 실패'))
      .finally(() => alive && setFoldersLoading(false));
  
    return () => { alive = false; };
  }, [isAuthenticated, loading]);


  const commitCreateFolder = async () => {
    const trimmed = newFolderName.trim();
    setIsCreatingFolder(false);
    if (!trimmed) { setNewFolderName('새로운 폴더'); return; }
  
    try {
      await createFolder(trimmed);
      const refreshed = await getFolders();
      setFolders(refreshed);
    } catch (e: any) {
      alert(e?.message || '폴더 생성 실패');
    } finally {
      setNewFolderName('새로운 폴더');
    }
  };

  const refreshFolders = async () => {
    const list = await getFolders();
    const map = new Map<number, FolderDto>();
    list.forEach(f => { if (!map.has(f.folderId)) map.set(f.folderId, f); });
    setFolders(Array.from(map.values()));
  };


  const startRename = (folder: FolderDto) => {
    setMenuId(null);
    setRenamingId(folder.folderId);
    setRenameValue(folder.name ?? '');
  };
  
  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };
  
  const commitRename = async () => {
    if (renamingId == null) return;
    const name = renameValue.trim();
    if (!name) { cancelRename(); return; }
    if (name.length > 20) { alert('폴더명은 최대 20자입니다.'); return; }
  
    try {
      await updateFolderName(renamingId, name); // PATCH /api/folders/{id} { name }
      await refreshFolders();
    } catch (e: any) {
      alert(e?.message || '폴더명 변경 실패');
    } finally {
      cancelRename();
    }
  };
  
  const handleFolderDelete = async (folder: FolderDto) => {
    setMenuId(null);
    if (folder.basic) {
      alert('기본 폴더는 삭제할 수 없습니다.');
      return;
    }
    if (!confirm('해당 폴더에 있는 모든 강의노트가 사라집니다. 삭제하시겠습니까?')) return;
  
    try {
      await deleteFolder(folder.folderId); // DELETE /api/folders/{id}
      await refreshFolders();
    } catch (e: any) {
      alert(e?.message || '폴더 삭제 실패');
    }
  };
  

  const handleSidebarMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowCollapseButton(true);
  };

  const handleSidebarMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowCollapseButton(false);
    }, 500); // 0.5초 지연
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    let alive = true;
  
    (async () => {
      try {
        setHistLoading(true);
        setHistError(null);
  
        const data: PagedResponse<LectureHistoryItem> = await fetchHistory({
          folderId: folderIdParam, // ← 사이드바에서 넘긴 folderId
          page: 0,
          size: 10,
          withAnno: false,
        });
  
        if (!alive) return;
        setItems(data.items ?? []);
      } catch (e: any) {
        if (!alive) return;
        setHistError(e?.message || '히스토리 조회 실패');
      } finally {
        if (alive) setHistLoading(false);
      }
    })();
  
    return () => { alive = false; };
  }, [folderIdParam]);
  
  const menuItems = [
    {
      path: '/dashboard',
      label: '대시보드',
      isActive: pathname === '/dashboard'
    },
    {
      path: '/home',
      label: '강의 사용',
      isActive: pathname === '/home'
    },
    {
      path: '/settings',
      label: '설정',
      isActive: pathname === '/settings'
    }
  ];

  return (
    <>
      {/* 펼치기 버튼 (왼쪽 화면 끝에 hover 시 나타남) */}
      {isCollapsed && (
        <div 
          className="fixed left-0 top-0 h-full w-4 z-50"
          onMouseEnter={() => setShowExpandButton(true)}
          onMouseLeave={() => setShowExpandButton(false)}
        >
          <button
            onClick={toggleCollapse}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-12 bg-[#2A3441] text-white rounded-r-lg shadow-lg transition-all duration-300 flex items-center justify-center hover:bg-[#3A4551] ${
              showExpandButton ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}
          >
            ›
          </button>
        </div>
      )}

      {/* 접기 버튼 (사이드바가 열려있을 때 hover 시 나타남) */}
      {!isCollapsed && (
        <button
          onClick={toggleCollapse}
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
          className={`absolute top-1/2 left-[280px] transform -translate-y-1/2 w-8 h-12 bg-[#2A3441] text-white rounded-l-lg shadow-lg transition-all duration-300 flex items-center justify-center hover:bg-[#3A4551] z-10 ${
            showCollapseButton ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          ‹
        </button>
      )}

      {/* 사이드바 */}
      <aside 
        className={`${isCollapsed ? 'w-0 overflow-hidden' : 'w-70'} bg-[#1D283C] border-r border-[#2A3441] shadow-[4px_0_20px_rgba(0,0,0,0.1)] flex-shrink-0 relative transition-all duration-300 ${className}`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        {/* 헤더 섹션 */}
        <div className="p-8 pb-6 border-b border-[#2A3441] bg-[#1D283C] text-white">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-lg font-bold text-white">Speak Note</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#2A3441] backdrop-blur-sm border border-[#3A4551]">
            {/* 모든 사용자: 프로필 이미지 표시 */}
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden shadow-lg">
              {loading ? (
                // 로딩 중: 스켈레톤 표시
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
              ) : guestAvatar ? (
                <Image
                  src={`/profile/${guestAvatar}`}
                  alt={isAuthenticated ? "사용자 프로필" : "게스트 프로필"}
                  width={60}
                  height={60}
                  className="w-full h-full object-cover"
                />
              ) : (
                // 프로필이 없을 때 기본 표시
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">?</span>
                </div>
              )}
            </div>
            <div>
              {loading ? (
                // 로딩 중: 스켈레톤 표시
                <>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-20"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </>
              ) : (
                <>
                  <h4 className="text-base font-semibold mb-1">{user?.name || '게스트'}</h4>
                  <p className="text-sm opacity-80">{user?.email || '게스트 이메일'}</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* 네비게이션 메뉴 */}
        <nav className="p-4 flex-1">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-all duration-300 rounded-lg ${
                  item.isActive
                    ? 'bg-[#2A3441] text-white'
                    : 'text-white hover:bg-[#2A3441]'
                }`}
              >
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* 강의 폴더 섹션 */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">강의 폴더</span>
              <button
                onClick={() => {
                  setIsCreatingFolder(true);
                  setNewFolderName("새로운 폴더");
                }}
                className="p-1 text-gray-400 hover:text-white hover:bg-[#2A3441] rounded"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1">
  {isCreatingFolder && (
    <div className="flex items-center gap-2 px-3 py-2 text-sm text-white rounded-lg bg-[#2A3441]">
      <Folder className="w-4 h-4 text-amber-400" />
      <input
        autoFocus
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        onBlur={commitCreateFolder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitCreateFolder();
          if (e.key === 'Escape') { setIsCreatingFolder(false); setNewFolderName('새로운 폴더'); }
        }}
        className="flex-1 bg-white/5 border border-[#3A4551] rounded-md px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A8C7FA]"
        placeholder="새로운 폴더"
      />
    </div>
  )}

  {foldersLoading && <div className="px-3 py-2 text-xs text-gray-400">폴더 불러오는 중…</div>}
  {foldersError && <div className="px-3 py-2 text-xs text-rose-400">{foldersError}</div>}
  {!foldersLoading && !foldersError && folders.length === 0 && (
    <div className="px-3 py-2 text-xs text-gray-400">폴더가 없습니다. + 버튼으로 만들어 보세요.</div>
  )}

  {folders.map((folder) => {
    const isHover = hoveredFolder === folder.folderId || menuId === folder.folderId;
    const isRenaming = renamingId === folder.folderId;

    return (
      <div key={folder.folderId} className="relative">
        <div
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-white rounded-lg group ${
            isHover ? 'bg-[#2A3441]' : 'hover:bg-[#2A3441]'
          }`}
          onMouseEnter={() => setHoveredFolder(folder.folderId)}
          onMouseLeave={() => setHoveredFolder(null)}
        >
          <Folder className="w-4 h-4 text-amber-400" />

          {/* 이름 표시 vs 인라인 수정 */}
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
    onMouseDown={(e) => e.stopPropagation()}   // ★ 추가(포커스 뺏김 방지)
    className="flex-1 bg-white/5 border border-[#3A4551] rounded-md px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A8C7FA]"
    placeholder="폴더명"
  />
) : (
    <button
      type="button"
      onClick={() => {
        const sp = new URLSearchParams(window.location.search);
        sp.set('folderId', String(folder.folderId));   // ← 선택한 폴더
        // 필요하면 페이지 초기화
        sp.delete('page');
        // 히스토리 모드로 열고 싶으면 ↓
        // sp.set('mode', 'history');
        router.push(`/dashboard?${sp.toString()}`);
      }}
      className="flex-1 text-left"
    >
      {folder.name}
    </button>
)}


          {!isRenaming && (
          <button
            onMouseDown={(e) => e.stopPropagation()}   // ★ 추가
            onClick={(e) => {
              e.stopPropagation();
              setMenuId(menuId === folder.folderId ? null : folder.folderId);
            }}
            className={`p-1 rounded hover:bg-white/5 ${isHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}
            type="button"
          >
            <MoreHorizontal className="w-3 h-3 text-gray-400" />
          </button>

          )}
        </div>

        {/* 컨텍스트 메뉴 */}
{menuId === folder.folderId && (
  <div
    onMouseDown={(e) => e.stopPropagation()}  // ★ 추가
    className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-fit"
  >
    <button
      onMouseDown={(e) => e.stopPropagation()} // ★ 추가(안전)
      onClick={() => startRename(folder)}
      disabled={!!folder.basic}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-t-lg whitespace-nowrap ${
        folder.basic ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'
      }`}
      type="button"
    >
      <Edit className="w-4 h-4" />
      폴더명 변경
    </button>
    <button
      onMouseDown={(e) => e.stopPropagation()} // ★ 추가(안전)
      onClick={() => handleFolderDelete(folder)}
      disabled={!!folder.basic}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-b-lg whitespace-nowrap ${
        folder.basic ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
      }`}
      type="button"
    >
      <Trash2 className="w-4 h-4" />
      폴더 삭제
    </button>
  </div>
)}

      </div>
    );
  })}
</div>


          </div>

          {/* 남은 시간 위젯 (추후 유료화를 위해 일단 넣음) */}
          <div className="mt-6 p-3 bg-[#2A3441] rounded-lg border border-[#3A4551]">
            <div className="flex items-center gap-2 text-sm text-white">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>480분 남음 / 600분</span>
            </div>
          </div>
        </nav>
        
        {/* 하단 섹션 */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="space-y-2">
            <button 
              onClick={handleAuthAction}
              className="w-full justify-start text-white hover:text-white hover:bg-[#2A3441] px-3 py-2 text-sm rounded-lg transition-all duration-200"
            >
              {isAuthenticated ? '로그아웃' : '로그인'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
