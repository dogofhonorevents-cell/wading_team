"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { use } from "react";
import { MyWeddingCard } from "@/components/wedding/my-wedding-card";
import { WeddingCard } from "@/components/wedding/wedding-card";
import { useWedding } from "@/hooks/use-weddings";
import { useAuth } from "@/providers/auth-provider";

export default function WeddingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const { data: wedding, isLoading, error } = useWedding(id);

  const backHref = user?.role === "admin" ? "/admin" : "/team";

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-6 space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-medium text-sage-700 hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div>
        <h1 className="font-serif text-3xl text-stone-900">Wedding Details</h1>
        <p className="mt-1 text-sm text-stone-600">
          You opened this from a notification email.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
          Loading wedding…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : "Failed to load wedding"}
        </div>
      ) : !wedding ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Wedding not found.
        </div>
      ) : user?.role === "admin" ? (
        <WeddingCard
          wedding={wedding}
          isAdmin
          initiallyExpanded
          showExpandToggle={false}
        />
      ) : (
        <MyWeddingCard wedding={wedding} currentUserId={user?.id ?? ""} />
      )}
    </main>
  );
}
