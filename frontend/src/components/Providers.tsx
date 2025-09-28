"use client";

import { AnnotationProvider } from "./AnnotationContext";
import { AuthProvider } from "./AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AnnotationProvider>
        {children}
      </AnnotationProvider>
    </AuthProvider>
  );
} 