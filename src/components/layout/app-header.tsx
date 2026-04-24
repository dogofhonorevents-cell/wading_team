"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { BellMenu } from "./bell-menu";

export function AppHeader({ showBell = false }: { showBell?: boolean }) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-navy-900 bg-navy-900 text-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="font-serif text-xl">
            <span className="text-blush-300">Paws</span>{" "}
            <span className="text-white">at the Altar</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {showBell ? <BellMenu /> : null}
          {user ? (
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-2 rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-stone-200 hover:bg-navy-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
