import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '토큰이 필요합니다' }, { status: 401 });
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거

    // 백엔드 API 호출
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const apiUrl = `${backendUrl}/app/users/profile`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: '토큰이 유효하지 않습니다' }, { status: 401 });
      }
      return NextResponse.json({ error: '백엔드 오류' }, { status: response.status });
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('사용자 프로필 가져오기 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
