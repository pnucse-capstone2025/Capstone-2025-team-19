import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 보호된 경로들
  const protectedPaths = ['/dashboard'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // 로컬 스토리지 대신 쿠키에서 토큰 확인
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      // 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/auth/signin', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
}; 