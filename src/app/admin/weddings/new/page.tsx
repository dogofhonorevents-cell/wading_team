"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { WeddingForm } from "@/components/wedding/wedding-form";
import { useCreateWedding } from "@/hooks/use-weddings";
import { ApiError } from "@/lib/api";

export default function NewWeddingPage() {
  const router = useRouter();
  const createWedding = useCreateWedding();
  const [error, setError] = useState<string | null>(null);

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
        <h1 className="font-serif text-3xl text-navy-900">New Wedding</h1>
        <p className="mt-1 text-sm text-stone-600">
          Fill in the details below. You can update any field later.
        </p>
      </div>

      <WeddingForm
        onSubmit={async (payload) => {
          setError(null);
          try {
            await createWedding.mutateAsync(payload);
            router.push("/admin");
          } catch (err) {
            const message =
              err instanceof ApiError
                ? err.message
                : err instanceof Error
                  ? err.message
                  : "Failed to create wedding";
            setError(message);
          }
        }}
        submitLabel="Create Wedding"
      />

      {error ? (
        <div className="mt-2 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </main>
  );
}
