"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { use, useMemo, useState } from "react";
import { WeddingForm } from "@/components/wedding/wedding-form";
import { useUpdateWedding, useWedding } from "@/hooks/use-weddings";
import { ApiError } from "@/lib/api";
import { weddingToFormValues } from "@/lib/wedding-schema";

export default function EditWeddingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: wedding, isLoading, error } = useWedding(id);
  const updateWedding = useUpdateWedding(id);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => (wedding ? weddingToFormValues(wedding) : undefined),
    [wedding]
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="font-serif text-3xl text-stone-900">Edit Wedding</h1>
        <p className="mt-1 text-sm text-stone-600">
          Update any details below. Saved changes are visible to assigned team
          members immediately.
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
      ) : !wedding || !defaultValues ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Wedding not found.
        </div>
      ) : (
        <>
          {submitError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          ) : null}

          <WeddingForm
            mode="update"
            defaultValues={defaultValues}
            submitLabel="Save Changes"
            onSubmit={async (payload) => {
              setSubmitError(null);
              try {
                await updateWedding.mutateAsync(payload);
                router.push("/admin");
              } catch (err) {
                setSubmitError(
                  err instanceof ApiError
                    ? err.message
                    : err instanceof Error
                    ? err.message
                    : "Failed to update wedding"
                );
              }
            }}
          />
        </>
      )}
    </main>
  );
}
