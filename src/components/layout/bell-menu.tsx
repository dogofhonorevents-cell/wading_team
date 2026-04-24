"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useMarkAllSeen, useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import type { Confirmation } from "@/types/api";

function extractUserName(user: Confirmation["user"]): string {
  if (typeof user === "string") return "Someone";
  return user.name || user.email;
}

function extractWeddingTitle(wedding: Confirmation["wedding"]): string {
  if (typeof wedding === "string") return "A wedding";
  return `${wedding.person1Name} & ${wedding.person2Name}`;
}

export function BellMenu() {
  const { data, isLoading } = useNotifications();
  const markAllSeen = useMarkAllSeen();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = data?.meta?.unreadCount ?? 0;
  const notifications = data?.data ?? [];

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white hover:bg-stone-50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-navy-700" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy-600 px-1 text-[11px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <p className="font-serif text-lg text-navy-900">Confirmations</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => markAllSeen.mutate()}
                disabled={markAllSeen.isPending}
                className="text-xs font-medium text-navy-700 hover:underline disabled:opacity-50"
              >
                Mark all as seen
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="p-4 text-sm text-stone-500">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-stone-500">
                No confirmations yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "border-b border-stone-100 px-4 py-3 last:border-b-0",
                    !n.seenByAdmin && "bg-blush-50"
                  )}
                >
                  <p className="text-sm text-navy-900">
                    <span className="font-semibold">{extractUserName(n.user)}</span>
                    {" confirmed "}
                    <span className="font-medium">
                      {extractWeddingTitle(n.wedding)}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {formatDistanceToNow(new Date(n.confirmedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
