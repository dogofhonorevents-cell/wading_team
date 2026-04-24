"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/providers/auth-provider";
import type { UserRole } from "@/types/api";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(user.role === "admin" ? "/admin" : "/team");
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
