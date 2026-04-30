/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import { CircleCheck, CircleDashed } from "lucide-react";
import { useMemo, useState } from "react";
import { MyWeddingCard } from "@/components/wedding/my-wedding-card";
import { useWeddings } from "@/hooks/use-weddings";
import { useMyConfirmations } from "@/hooks/use-confirmations";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import type { ChaperoneRef, Confirmation, Wedding } from "@/types/api";

type Filter = "all" | "confirmed" | "waiting";

function chaperoneId(ref: string | ChaperoneRef | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  return ref.id ?? ref._id ?? null;
}

function isAssignedTo(wedding: Wedding, userId: string): boolean {
  if (!userId) return false;
  if (chaperoneId(wedding.primaryChaperone) === userId) return true;
  if (chaperoneId(wedding.secondaryChaperone) === userId) return true;
  return false;
}

function confirmedWeddingIdsFor(
  confirmations: Confirmation[] | undefined
): Set<string> {
  const out = new Set<string>();
  if (!confirmations) return out;
  for (const c of confirmations) {
    if (!c.wedding) continue;
    const wid = typeof c.wedding === "string" ? c.wedding : c.wedding.id;
    if (wid) out.add(wid);
  }
  return out;
}

function newestFirst(a: Wedding, b: Wedding): number {
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return bTime - aTime;
}

export default function TeamDashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useWeddings();
  const { data: myConfirmations } = useMyConfirmations();
  const [filter, setFilter] = useState<Filter>("all");

  const weddings = useMemo(() => {
    const all = data ?? [];
    const mine = user?.id ? all.filter((w) => isAssignedTo(w, user.id)) : [];
    return [...mine].sort(newestFirst);
  }, [data, user?.id]);

  const confirmedIds = useMemo(
    () => confirmedWeddingIdsFor(myConfirmations),
    [myConfirmations]
  );

  const booked = weddings.filter((w) => w.status === "booked");
  const tentative = weddings.filter((w) => w.status === "tentative");

  const counts = useMemo(() => {
    let confirmed = 0;
    let waiting = 0;
    for (const w of booked) {
      if (confirmedIds.has(w.id)) confirmed++;
      else waiting++;
    }
    return { all: booked.length, confirmed, waiting };
  }, [booked, confirmedIds]);

  const filteredBooked = useMemo(() => {
    if (filter === "all") return booked;
    if (filter === "confirmed") {
      return booked.filter((w) => confirmedIds.has(w.id));
    }
    return booked.filter((w) => !confirmedIds.has(w.id));
  }, [booked, confirmedIds, filter]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-6 space-y-6">
      <div className="rounded-2xl bg-sage-800 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-blush-300">
          Logged in as
        </p>
        <h1 className="mt-1 font-serif text-3xl">{user?.name ?? "Team member"}</h1>
        {user?.email ? (
          <p className="mt-1 text-xs text-blush-200">{user.email}</p>
        ) : null}
        <p className="mt-2 text-sm text-sage-100">
          {booked.length} booked · {tentative.length} tentative
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
          Loading your weddings…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load weddings:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : weddings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <p className="text-stone-600">
            You have no wedding assignments yet.
          </p>
          <p className="mt-1 text-sm text-stone-500">
            The owner will assign you as a chaperone when a wedding is booked.
          </p>
        </div>
      ) : (
        <>
          {booked.length > 0 ? (
            <section className="space-y-4">
              <SectionHeading
                tone="booked"
                icon={<CircleCheck className="h-5 w-5" />}
                label="Booked — Hold these dates"
              />

              <div className="flex flex-wrap gap-2">
                <FilterTab
                  label="All"
                  count={counts.all}
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                />
                <FilterTab
                  label="Not Confirmed"
                  count={counts.waiting}
                  active={filter === "waiting"}
                  onClick={() => setFilter("waiting")}
                />
                <FilterTab
                  label="Confirmed"
                  count={counts.confirmed}
                  active={filter === "confirmed"}
                  onClick={() => setFilter("confirmed")}
                />
              </div>

              {filteredBooked.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
                  No weddings match this filter.
                </div>
              ) : (
                filteredBooked.map((w) => (
                  <MyWeddingCard
                    key={w.id}
                    wedding={w}
                    currentUserId={user?.id ?? ""}
                  />
                ))
              )}
            </section>
          ) : null}

          {tentative.length > 0 ? (
            <section className="space-y-4">
              <SectionHeading
                tone="tentative"
                icon={<CircleDashed className="h-5 w-5" />}
                label="Tentative — Keep on your radar"
              />
              {tentative.map((w) => (
                <MyWeddingCard
                  key={w.id}
                  wedding={w}
                  currentUserId={user?.id ?? ""}
                />
              ))}
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}

function SectionHeading({
  tone,
  icon,
  label,
}: {
  tone: "booked" | "tentative";
  icon: React.ReactNode;
  label: string;
}) {
  const toneClass =
    tone === "booked" ? "text-sage-700" : "text-rose-700";
  return (
    <div
      className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-widest ${toneClass}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-sage-700 bg-sage-700 text-white"
          : "border-sage-200 bg-white text-sage-700 hover:bg-sage-50"
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-semibold",
          active ? "bg-white/20 text-white" : "bg-sage-100 text-sage-700"
        )}
      >
        {count}
      </span>
    </button>
  );
}
