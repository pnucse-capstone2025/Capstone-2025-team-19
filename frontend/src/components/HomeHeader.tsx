// components/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, signIn, signOut, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      signOut();
    } else {
      router.push("/auth/signin");
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white shadow z-50">
      <nav className="max-w-screen-xl mx-auto flex items-center justify-between h-16 px-6">
        <Link href="/" className="flex items-center">
          <Image src="/speaknoteLogo.png" alt="Speak Note 로고" width={75} height={40} />
        </Link>

        <ul className="hidden md:flex gap-8 text-[16px] text-slate-700 font-medium">
          <li><a href="#features">기능</a></li>
          <li><a href="#how-it-works">사용법</a></li>
          <li><a href="#demo">데모</a></li>
          <li><a href="#faq-section">자주 묻는 질문</a></li>
          <li><a href="#contact">문의</a></li>
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleAuthAction}
            className="text-slate-700 font-medium hover:text-blue-600 transition-colors"
          >
            {isAuthenticated ? `${user?.name || '사용자'} 로그아웃` : '로그인'}
          </button>
          <Link
            href="/home"
            className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-5 rounded-full transition duration-200"
          >
            지금 시작하기
          </Link>
        </div>
      </nav>
    </header>
  );
}
