export interface DroppedAnnotation {
    id: string;
    text: string;
    x: number;
    y: number;
    pageNumber: number;
    width?: number;
    height?: number;
    markdown?: string;
    answerState?: number; 
  }