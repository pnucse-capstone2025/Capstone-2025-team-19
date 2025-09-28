import { OauthRes } from '@/types/auth';

export const auth = {
  // JWT 토큰 저장
  setTokens(tokens: OauthRes) {
    if (typeof window !== 'undefined') {
      // 쿠키에 토큰 저장 (httpOnly: false로 설정하여 클라이언트에서 접근 가능)
      document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=3600; SameSite=Lax`;
      document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `userId=${tokens.userId}; path=/; max-age=3600; SameSite=Lax`;
      
      // 로컬 스토리지에도 백업 저장
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('userId', tokens.userId.toString());
    }
  },

  // 액세스 토큰 가져오기
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      // 쿠키에서 먼저 확인
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
      if (accessTokenCookie) {
        return accessTokenCookie.split('=')[1];
      }
      // 로컬 스토리지에서 확인
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  // 리프레시 토큰 가져오기
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      // 쿠키에서 먼저 확인
      const cookies = document.cookie.split(';');
      const refreshTokenCookie = cookies.find(cookie => cookie.trim().startsWith('refreshToken='));
      if (refreshTokenCookie) {
        return refreshTokenCookie.split('=')[1];
      }
      // 로컬 스토리지에서 확인
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  // 사용자 ID 가져오기
  getUserId(): number | null {
    if (typeof window !== 'undefined') {
      // 쿠키에서 먼저 확인
      const cookies = document.cookie.split(';');
      const userIdCookie = cookies.find(cookie => cookie.trim().startsWith('userId='));
      if (userIdCookie) {
        const userId = userIdCookie.split('=')[1];
        return userId ? parseInt(userId) : null;
      }
      // 로컬 스토리지에서 확인
      const userId = localStorage.getItem('userId');
      return userId ? parseInt(userId) : null;
    }
    return null;
  },

  // 로그아웃
  logout() {
    if (typeof window !== 'undefined') {
      // 쿠키 삭제
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // 로컬 스토리지 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
    }
  },

  // 로그인 상태 확인
  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  },
};

// 구글 OAuth 설정
export const googleAuth = {
  getAuthUrl(): string {
    const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
    const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

    if (!CLIENT_ID) {
      throw new Error('Google OAuth 설정이 누락되었습니다.');
    }

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  },

  // 구글 로그인 시작
  startLogin() {
    const authUrl = this.getAuthUrl();
    window.location.href = authUrl;
  },
}; 