"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { auth } from "@/lib/auth";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 이미 로그인된 사용자는 대시보드로 리다이렉트 (새로고침 포함)
    if (auth.isLoggedIn()) {
      window.location.href = "/dashboard";
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Google OAuth 시작
      const { googleAuth } = await import('@/lib/auth');
      googleAuth.startLogin();
    } catch (error) {
      console.error("로그인 오류:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* 로고 섹션 */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
            <Image
              src="/speaknoteLogo.png"
              alt="Speak Note Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Speak Note에 오신 것을 환영합니다
          </h2>
          <p className="text-gray-600 text-lg">
            강의 내용을 더욱 스마트하게 관리하세요
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* 구글 로그인 버튼 */}
            <GoogleLoginButton 
              className="w-full px-6 py-4 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">로그인 중...</span>
                </div>
              ) : (
                <span className="text-gray-700 font-medium">
                  Google로 계속하기
                </span>
              )}
            </GoogleLoginButton>

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            {/* 게스트 로그인 */}
            <button
              onClick={() => router.push("/home")}
              className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-5 h-5 mr-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-gray-700 font-medium">게스트로 시작하기</span>
            </button>
          </div>

          {/* 서비스 소개 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Speak Note의 주요 기능
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">실시간 음성 인식으로 강의 내용 자동 분석</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">강의자료 기반 맞춤형 주석 생성</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">드래그앤드롭으로 주석 위치 자유 조정</span>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center text-gray-500 text-sm">
          <p>로그인함으로써 Speak Note의</p>
          <p>
            <a href="#" className="text-blue-600 hover:underline">
              이용약관
            </a>{" "}
            및{" "}
            <a href="#" className="text-blue-600 hover:underline">
              개인정보처리방침
            </a>
            에 동의합니다
          </p>
        </div>
      </div>
    </div>
  );
} 