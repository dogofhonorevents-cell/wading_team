/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { WeddingCard } from "@/components/wedding/wedding-card";
import { useWeddings } from "@/hooks/use-weddings";
import { useAllConfirmations } from "@/hooks/use-confirmations";
import { useUsers } from "@/hooks/use-users";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import type { ChaperoneRef, Confirmation, Wedding } from "@/types/api";

type Filter = "all" | "confirmed" | "waiting" | "tentative";

const PAGE_SIZE = 20;

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
  if (!c.wedding) return null;
  if (typeof c.wedding === "string") return c.wedding;
  return c.wedding.id ?? null;
}

function confirmationUserId(c: Confirmation): string | null {
  if (!c.user) return null;
  if (typeof c.user === "string") return c.user;
  return c.user.id ?? null;
}

function computeSummary(
  wedding: Wedding,
  confirmations: Confirmation[] | undefined
): Summary {
  const primary = refId(wedding.primaryChaperone);
  const secondary = refId(wedding.secondaryChaperone);
  const assigned = (primary ? 1 : 0) + (secondary ? 1 : 0);

  const assignedIds = new Set([primary, secondary].filter(Boolean) as string[]);

  const validForThisWedding = (confirmations ?? []).filter((c) => {
    if (confirmationWeddingId(c) !== wedding.id) return false;
    const uid = confirmationUserId(c);
    return uid !== null && assignedIds.has(uid);
  });

  return { assigned, confirmed: validForThisWedding.length };
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useWeddings();
  const { data: confirmations } = useAllConfirmations();
  const { data: teamMembers } = useUsers({ role: "team_member", isActive: true });
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const [teamMemberId, setTeamMemberId] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [prevFilterKey, setPrevFilterKey] = useState("all|all");

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

  const byTeamMember = useMemo(() => {
    if (teamMemberId === "all") return weddings;
    return weddings.filter((w) => {
      const primary = refId(w.primaryChaperone);
      const secondary = refId(w.secondaryChaperone);
      return primary === teamMemberId || secondary === teamMemberId;
    });
  }, [weddings, teamMemberId]);

  const counts = useMemo(() => {
    let confirmed = 0;
    let waiting = 0;
    let tentative = 0;
    for (const w of byTeamMember) {
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
    return { all: byTeamMember.length, confirmed, waiting, tentative };
  }, [byTeamMember, summaries]);

  const filtered = useMemo(() => {
    if (filter === "all") return byTeamMember;
    if (filter === "tentative") {
      return byTeamMember.filter((w) => w.status === "tentative");
    }
    const wantConfirmed = filter === "confirmed";
    return byTeamMember.filter((w) => {
      if (w.status !== "booked") return false;
      const s = summaries.get(w.id);
      if (!s) return false;
      const allConfirmed = s.assigned > 0 && s.confirmed >= s.assigned;
      return wantConfirmed ? allConfirmed : !allConfirmed;
    });
  }, [byTeamMember, summaries, filter]);

  const filterKey = `${filter}|${teamMemberId}`;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = useMemo(
    () =>
      filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

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

      <div className="mt-6">
        <label className="mb-2 block text-xs font-medium text-stone-600">
          Team member
        </label>
        <Select
          value={teamMemberId}
          onChange={(e) => setTeamMemberId(e.target.value)}
          className="max-w-xs"
        >
          <option value="all">All team members</option>
          {(teamMembers ?? []).map((m) => (
            <option key={m.id} value={m.id}>
              {m.name || m.email}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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
          <>
            {paged.map((w) => (
              <WeddingCard
                key={w.id}
                wedding={w}
                isAdmin
                confirmationSummary={summaries.get(w.id)}
              />
            ))}

            {pageCount > 1 ? (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-stone-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-stone-600">
                    Page {currentPage} of {pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
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
