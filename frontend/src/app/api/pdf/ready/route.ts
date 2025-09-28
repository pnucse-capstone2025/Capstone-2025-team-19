import { NextRequest, NextResponse } from 'next/server';

// 전역 상태로 PDF ready 상태를 관리 (실제로는 Redis나 DB를 사용하는 것이 좋음)
const pdfReadyStatus = new Map<string, boolean>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 [FRONTEND] PDF ready 알림 수신:', body);
    
    // PDF 처리 완료 알림 처리
    const { fileId, userId } = body;
    
    // PDF ready 상태 저장
    if (fileId) {
      pdfReadyStatus.set(String(fileId), true);
      console.log(`✅ [FRONTEND] PDF ready 상태 저장 - fileId: ${fileId}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'PDF ready 알림 처리 완료' 
    });
    
  } catch (error) {
    console.error('❌ [FRONTEND] PDF ready 알림 처리 중 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'PDF ready 알림 처리 실패' 
      },
      { status: 500 }
    );
  }
}

// PDF 상태 확인 엔드포인트
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }
    
    const isReady = pdfReadyStatus.get(fileId) || false;
    
    return NextResponse.json({
      fileId,
      status: isReady ? 'ready' : 'processing'
    });
    
  } catch (error) {
    console.error('❌ [FRONTEND] PDF 상태 확인 중 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'PDF 상태 확인 실패' 
      },
      { status: 500 }
    );
  }
}
