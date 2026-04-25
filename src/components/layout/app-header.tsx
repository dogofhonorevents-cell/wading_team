"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { BellMenu } from "./bell-menu";

export function AppHeader({ showBell = false }: { showBell?: boolean }) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-sage-700 bg-white text-sage-900 shadow-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Dog of Honor Weddings & Events"
            className="h-12 w-auto sm:h-14"
            onError={(e) => {
              // Hide the image element if the file is missing so the text
              // brand still renders cleanly.
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="font-serif text-lg leading-tight sm:text-xl">
            <span className="block text-sage-700">Dog of Honor</span>
            <span className="block text-xs uppercase tracking-widest text-sage-500">
              Weddings &amp; Events
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {showBell ? <BellMenu /> : null}
          {user ? (
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-2 rounded-lg border border-sage-200 bg-sage-50 px-3 py-2 text-sm text-sage-800 hover:bg-sage-100"
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
