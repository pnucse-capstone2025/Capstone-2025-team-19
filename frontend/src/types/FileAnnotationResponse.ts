export interface FileAnnotationResponse {
    fileId: number;
    fileName: string;
    fileUrl: string;               // ← 이걸 PDFViewer에 던질 거야
    snapshotCreatedAt: string;
    version: number;
    latest: boolean;
    slides: {
      pageNumber: number;
      annotations: Array<{
        id: string;
        text?: string;
        payload?: Record<string, any>;
        position: { x: number; y: number };  // 0~1
        size: { width: number; height: number }; // 0~1
        source: 'PPT' | 'MANUAL' | 'PDF';
        order?: number;
        createdAt?: string;
        updatedAt?: string;
        answerState?: number;
      }>;
    }[];
  }