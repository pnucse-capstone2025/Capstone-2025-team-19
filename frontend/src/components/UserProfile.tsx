"use client";

import { useAuth } from "./AuthContext";
import Image from "next/image";

export default function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
      <div className="relative">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">
            {user.name?.charAt(0) || "U"}
          </span>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.name}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {user.email}
        </p>
      </div>
      
      <button
        onClick={() => signOut()}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
} 