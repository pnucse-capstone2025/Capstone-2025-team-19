"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/auth";

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
  isAuthenticated: boolean;
  setUserFromTokens: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const checkAuth = async () => {
      if (auth.isLoggedIn()) {
        try {
          // 백엔드에서 사용자 정보 가져오기
          const response = await fetch('/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${auth.getAccessToken()}`,
            },
          });
          
          if (response.ok) {
            const responseData = await response.json();
            // 백엔드 응답 형식에 맞게 result 객체에서 사용자 정보 추출
            if (responseData.isSuccess && responseData.result) {
              setUser(responseData.result);
            } else {
              console.error('사용자 정보 형식 오류:', responseData);
              auth.logout();
              setUser(null);
            }
          } else {
            // 토큰이 유효하지 않은 경우 로그아웃
            auth.logout();
            setUser(null);
          }
        } catch (error) {
          console.error('사용자 정보 가져오기 실패:', error);
          // 네트워크 오류 등의 경우에도 로그아웃
          auth.logout();
          setUser(null);
        }
      } else {
        // 로그인하지 않은 경우
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleSignIn = () => {
    // Google OAuth 시작
    const { googleAuth } = require('@/lib/auth');
    googleAuth.startLogin();
  };

  const handleSignOut = () => {
    auth.logout();
    setUser(null);
    window.location.href = "/";
  };

  // 로그인 성공 후 사용자 정보 설정 함수
  const setUserFromTokens = async () => {
    if (auth.isLoggedIn()) {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${auth.getAccessToken()}`,
          },
        });
        
        if (response.ok) {
          const responseData = await response.json();
          if (responseData.isSuccess && responseData.result) {
            setUser(responseData.result);
            return true;
          }
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
      }
    }
    return false;
  };

  const value = {
    user,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!user,
    setUserFromTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 