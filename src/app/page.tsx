"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(user.role === "admin" ? "/admin" : "/team");
  }, [user, loading, router]);

  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="flex items-center gap-3 text-stone-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
        <span className="text-sm">Loading…</span>
      </div>
    </main>
  );
}
