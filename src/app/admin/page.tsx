"use client";

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { WeddingCard } from "@/components/wedding/wedding-card";
import { useWeddings } from "@/hooks/use-weddings";
import { useAllConfirmations } from "@/hooks/use-confirmations";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import type { ChaperoneRef, Confirmation, Wedding } from "@/types/api";

type Filter = "all" | "confirmed" | "waiting" | "tentative";

interface Summary {
  assigned: number;
  confirmed: number;
}

function refId(ref: string | ChaperoneRef | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  return ref.id ?? ref._id ?? null;
}

function confirmationWeddingId(c: Confirmation): string | null {
  if (typeof c.wedding === "string") return c.wedding;
  return c.wedding.id ?? null;
}

function computeSummary(
  wedding: Wedding,
  confirmations: Confirmation[] | undefined
): Summary {
  const primary = refId(wedding.primaryChaperone);
  const secondary = refId(wedding.secondaryChaperone);
  const assigned = (primary ? 1 : 0) + (secondary ? 1 : 0);
  const forThisWedding =
    confirmations?.filter((c) => confirmationWeddingId(c) === wedding.id) ?? [];
  return { assigned, confirmed: forThisWedding.length };
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useWeddings();
  const { data: confirmations } = useAllConfirmations();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");

  const weddings = data ?? [];
  const total = weddings.length;
  const bookedCount = weddings.filter((w) => w.status === "booked").length;

  const summaries = useMemo(() => {
    const map = new Map<string, Summary>();
    for (const w of weddings) {
      map.set(w.id, computeSummary(w, confirmations));
    }
    return map;
  }, [weddings, confirmations]);

  const counts = useMemo(() => {
    let confirmed = 0;
    let waiting = 0;
    let tentative = 0;
    for (const w of weddings) {
      if (w.status === "tentative") {
        tentative++;
        continue;
      }
      const s = summaries.get(w.id);
      if (s && s.assigned > 0 && s.confirmed >= s.assigned) {
        confirmed++;
      } else {
        waiting++;
      }
    }
    return { all: weddings.length, confirmed, waiting, tentative };
  }, [weddings, summaries]);

  const filtered = useMemo(() => {
    if (filter === "all") return weddings;
    if (filter === "tentative") {
      return weddings.filter((w) => w.status === "tentative");
    }
    const wantConfirmed = filter === "confirmed";
    return weddings.filter((w) => {
      if (w.status !== "booked") return false;
      const s = summaries.get(w.id);
      if (!s) return false;
      const allConfirmed = s.assigned > 0 && s.confirmed >= s.assigned;
      return wantConfirmed ? allConfirmed : !allConfirmed;
    });
  }, [weddings, summaries, filter]);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-sage-900">
            {user?.name ?? "Owner"}
          </h1>
          {user?.email ? (
            <p className="text-xs text-stone-500">{user.email}</p>
          ) : null}
          <p className="mt-2 text-sm text-stone-600">
            {total} weddings · {bookedCount} booked
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/users">
            <Button variant="outline" size="lg" className="gap-2">
              <Users className="h-5 w-5" />
              Manage Team
            </Button>
          </Link>
          <Link href="/admin/weddings/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Add Wedding
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterTab
          label="All"
          count={counts.all}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterTab
          label="Confirmed"
          count={counts.confirmed}
          active={filter === "confirmed"}
          onClick={() => setFilter("confirmed")}
        />
        <FilterTab
          label="Waiting"
          count={counts.waiting}
          active={filter === "waiting"}
          onClick={() => setFilter("waiting")}
        />
        <FilterTab
          label="Tentative"
          count={counts.tentative}
          active={filter === "tentative"}
          onClick={() => setFilter("tentative")}
        />
      </div>

      <section className="mt-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
            Loading weddings…
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load weddings:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : weddings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="text-stone-600">No weddings yet.</p>
            <Link
              href="/admin/weddings/new"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sage-700 hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add your first wedding
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-600">
            No weddings match this filter.
          </div>
        ) : (
          filtered.map((w) => (
            <WeddingCard
              key={w.id}
              wedding={w}
              isAdmin
              confirmationSummary={summaries.get(w.id)}
            />
          ))
        )}
      </section>
    </main>
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
          ? "border-sage-900 bg-sage-900 text-white"
          : "border-stone-200 bg-white text-sage-700 hover:bg-stone-100"
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-semibold",
          active ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
        )}
      >
        {count}
      </span>
    </button>
  );
}
