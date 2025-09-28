'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setError('Google 로그인이 취소되었습니다.');
        setStatus('error');
        return;
      }

      if (!code) {
        setError('인증 코드가 없습니다.');
        setStatus('error');
        return;
      }

      try {
        // 백엔드 API 호출
        const response = await api.googleLogin(code);
        
        if (response.isSuccess) {
          // 로그인 성공 - JWT 토큰 저장
          auth.setTokens({
            userId: response.result.userId,
            accessToken: response.result.accessToken,
            refreshToken: response.result.refreshToken,
          });
          setStatus('success');
          
          // 대시보드로 리다이렉트 (새로고침 포함)
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        }
      } catch (error: any) {
        console.error('Google 로그인 에러:', error);
        
        // 백엔드 서버가 응답하지 않는 경우 임시 처리
        if (error.message.includes('<!DOCTYPE') || error.message.includes('Unexpected token') || error.message.includes('Failed to fetch')) {
          setError('백엔드 서버에 연결할 수 없습니다. CORS 설정과 Spring Security 설정을 확인해주세요.');
          setStatus('error');
          return;
        }
        
        // 새 사용자인 경우 (code: 2001)
        if (error.code === 2001) {
          // 회원가입 페이지로 이동
          router.push(`/signup?socialInfo=${encodeURIComponent(JSON.stringify(error.result))}&socialType=google`);
        } else {
          setError(error.message || '로그인 중 오류가 발생했습니다.');
          setStatus('error');
        }
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Google 로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">로그인 실패</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-600 text-lg mb-4">로그인 성공!</div>
          <p className="text-gray-600">대시보드로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return null;
} 