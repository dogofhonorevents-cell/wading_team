"use client";

import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppHeader } from "@/components/layout/app-header";

export default function WeddingsLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppHeader />
      <div className="flex-1">{children}</div>
    </ProtectedRoute>
  );
}
