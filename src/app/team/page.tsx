"use client";

import { CircleCheck, CircleDashed } from "lucide-react";
import { MyWeddingCard } from "@/components/wedding/my-wedding-card";
import { useWeddings } from "@/hooks/use-weddings";
import { useAuth } from "@/providers/auth-provider";
import type { ChaperoneRef, Wedding } from "@/types/api";

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

export default function TeamDashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useWeddings();

  const all = data ?? [];
  const weddings = user?.id
    ? all.filter((w) => isAssignedTo(w, user.id))
    : [];
  const booked = weddings.filter((w) => w.status === "booked");
  const tentative = weddings.filter((w) => w.status === "tentative");

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
              {booked.map((w) => (
                <MyWeddingCard
                  key={w.id}
                  wedding={w}
                  currentUserId={user?.id ?? ""}
                />
              ))}
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
    tone === "booked" ? "text-emerald-800" : "text-rose-700";
  return (
    <div
      className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-widest ${toneClass}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
