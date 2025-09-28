import { LoginResponse, BaseResponse } from '@/types/auth';
import { FileAnnotationResponse } from '@/types/FileAnnotationResponse';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // 인증 토큰 가져오기
    const { auth } = await import('./auth');
    const accessToken = auth.getAccessToken();
    
    const headers: Record<string, string> = {};

    // options?.headers가 있으면 먼저 병합
    if (options?.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    // Authorization 헤더는 로그인 상태로만 설정, 게스트는 반드시 제거
    delete (headers as Record<string, string>)['Authorization'];
    delete (headers as Record<string, string>)['authorization'];
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // FormData가 아닌 경우에만 기본 Content-Type 설정
    const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;
    if (!isFormData && !('Content-Type' in headers)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    // 302 리다이렉트 처리
    if (response.status === 302) {
      throw new ApiError(302, '인증이 필요합니다. 백엔드 설정을 확인해주세요.', 302);
    }

    // 응답이 JSON이 아닌 경우 처리
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new ApiError(response.status, '서버에서 JSON 응답을 받지 못했습니다.', response.status);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'API 요청 실패', data.code);
    }

    return data;
  },

  // 구글 소셜 로그인
  async googleLogin(code: string): Promise<LoginResponse> {
    return this.request<LoginResponse>(`/app/users/auth/google/login?code=${code}`, {
      method: 'GET'
    });
  },

  // 액세스 토큰으로 로그인 (선택적)
  async googleLoginWithToken(accessToken: string): Promise<LoginResponse> {
    return this.request<LoginResponse>(`/app/users/auth/google/login?accessToken=${accessToken}`, {
      method: 'GET'
    });
  },
}; 


export async function fetchFileAnnotations(
  fileId: number,
  version?: number
): Promise<FileAnnotationResponse> {
  const qs = new URLSearchParams();
  if (version != null) qs.set('version', String(version));
  const url = `/api/files/${fileId}/annotations${qs.toString() ? `?${qs.toString()}` : ''}`;

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Annotation fetch failed: ${res.status} ${text}`);
  }
  return res.json();
}