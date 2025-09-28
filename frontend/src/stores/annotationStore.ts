import { create } from 'zustand';
import { FileAnnotationResponse } from '@/types/FileAnnotationResponse';

type AnnotationItem = {
  id: string;
  page: number; // 1-based
  text?: string;
  payload?: Record<string, any>;
  // 좌표는 '정규화'로 유지 권장. (렌더 단계에서 px로 변환)
  nx: number; ny: number; nwidth: number; nheight: number;
  order?: number;
  source: 'PPT' | 'MANUAL' | 'PDF';
  answerState?: number;
  createdAt?: string;
  updatedAt?: string;
};

type State = {
  pdfUrl: string | null;
  fileMeta?: { fileId: number; fileName: string; version: number; latest: boolean; snapshotCreatedAt?: string; mode?: 'history' | 'live' };
  annotations: AnnotationItem[];
};

type Actions = {
  reset: () => void;
  hydrateFromServer: (resp: FileAnnotationResponse, mode?: 'history' | 'live') => void;
};

export const useAnnotationStore = create<State & Actions>((set) => ({
  pdfUrl: null,
  annotations: [],
  reset: () => set({ pdfUrl: null, annotations: [], fileMeta: undefined }),
  hydrateFromServer: (resp, mode) => set({
    pdfUrl: resp.fileUrl,
    fileMeta: {
      fileId: resp.fileId,
      fileName: resp.fileName,
      version: resp.version,
      latest: resp.latest,
      snapshotCreatedAt: resp.snapshotCreatedAt,
      mode: mode ?? 'history',
    },
    annotations: (resp.slides ?? []).flatMap(s =>
      (s.annotations ?? []).map(a => ({
        id: a.id,
        page: s.pageNumber,
        text: a.text,
        payload: a.payload,
        nx: a.position?.x ?? 0,
        ny: a.position?.y ?? 0,
        nwidth: a.size?.width ?? 0,
        nheight: a.size?.height ?? 0,
        order: a.order,
        source: a.source,
        answerState: a.answerState,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }))
    ),
  }),
}));