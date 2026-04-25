"use client";

import Link from "next/link";
import {
  ChevronDown,
  MapPin,
  Calendar,
  PawPrint,
  Pencil,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardSection } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { useWeddingConfirmations } from "@/hooks/use-confirmations";
import {
  useDeleteWedding,
  useToggleWeddingStatus,
} from "@/hooks/use-weddings";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ChaperoneRef, Confirmation, Wedding } from "@/types/api";

function chaperoneId(ref: string | ChaperoneRef | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  return ref.id ?? ref._id ?? null;
}

function chaperoneName(ref: string | ChaperoneRef | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === "string") return null;
  return ref.name ?? ref.email;
}

function formatDate(iso?: string, pattern = "EEE, MMM d, yyyy"): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), pattern);
  } catch {
    return "—";
  }
}

interface WeddingCardProps {
  wedding: Wedding;
  confirmedLabel?: string;
  showExpandToggle?: boolean;
  initiallyExpanded?: boolean;
  isAdmin?: boolean;
  confirmationSummary?: { assigned: number; confirmed: number };
}

export function WeddingCard({
  wedding,
  confirmedLabel,
  showExpandToggle = true,
  initiallyExpanded = false,
  isAdmin = false,
  confirmationSummary,
}: WeddingCardProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [actionError, setActionError] = useState<string | null>(null);

  const primaryName = chaperoneName(wedding.primaryChaperone);
  const secondaryName = chaperoneName(wedding.secondaryChaperone);
  const dogNames = wedding.dogs.map((d) => d.name).filter(Boolean);

  const toggleStatus = useToggleWeddingStatus(wedding.id);
  const deleteWedding = useDeleteWedding();

  const handleToggleStatus = async () => {
    setActionError(null);
    const next = wedding.status === "booked" ? "tentative" : "booked";
    try {
      await toggleStatus.mutateAsync(next);
    } catch (err) {
      setActionError(toErrorMessage(err, "Could not update status"));
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete wedding for ${wedding.person1Name} & ${wedding.person2Name}? This cannot be undone.`
    );
    if (!confirmed) return;
    setActionError(null);
    try {
      await deleteWedding.mutateAsync(wedding.id);
    } catch (err) {
      setActionError(toErrorMessage(err, "Could not delete"));
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl text-sage-900">
              {wedding.person1Name} & {wedding.person2Name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={wedding.status} />
              {isAdmin &&
              wedding.status === "booked" &&
              confirmationSummary &&
              confirmationSummary.assigned > 0 ? (
                <ConfirmSummaryBadge summary={confirmationSummary} />
              ) : null}
            </div>
          </div>

          {showExpandToggle ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex flex-col items-end gap-1 text-right"
            >
              {confirmedLabel ? (
                <span className="text-xs font-medium text-stone-600">
                  {confirmedLabel}
                </span>
              ) : null}
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-stone-500 transition-transform",
                  expanded && "rotate-180"
                )}
              />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-stone-400" />
            {formatDate(wedding.weddingDate)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-stone-400" />
            {wedding.venue}
          </span>
          {dogNames.length > 0 ? (
            <span className="flex items-center gap-1">
              <PawPrint className="h-4 w-4 text-stone-400" />
              {dogNames.join(", ")}
            </span>
          ) : null}
        </div>

        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
            <Link href={`/admin/weddings/${wedding.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              loading={toggleStatus.isPending}
            >
              {wedding.status === "booked"
                ? "Mark Tentative"
                : "Mark Booked"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleteWedding.isPending}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            {actionError ? (
              <span className="text-xs text-red-600">{actionError}</span>
            ) : null}
          </div>
        ) : null}

        {expanded ? (
          <div className="mt-2 space-y-5">
            <CardSection title="Couple Contacts">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ContactBlock
                  label="Person 1"
                  name={wedding.person1Name}
                  phone={wedding.person1Phone}
                />
                <ContactBlock
                  label="Person 2"
                  name={wedding.person2Name}
                  phone={wedding.person2Phone}
                />
              </div>
            </CardSection>

            <CardSection title="Chaperone Roles">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Badge tone="primary">★ Primary</Badge>
                  <p className="mt-2 text-sm text-sage-900">{primaryName ?? "—"}</p>
                </div>
                <div>
                  <Badge tone="secondary">Secondary</Badge>
                  <p className="mt-2 text-sm text-sage-900">
                    {secondaryName ?? "— None —"}
                  </p>
                </div>
              </div>
            </CardSection>

            {isAdmin ? <AdminConfirmationStatus wedding={wedding} /> : null}

            {(wedding.plannerName ||
              wedding.photographerName ||
              wedding.videographerName) && (
              <CardSection title="Vendors">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {wedding.plannerName ? (
                    <Field label="Planner" value={formatContact(wedding.plannerName, wedding.plannerPhone)} />
                  ) : null}
                  {wedding.photographerName ? (
                    <Field label="Photographer" value={wedding.photographerName} />
                  ) : null}
                  {wedding.videographerName ? (
                    <Field label="Videographer" value={wedding.videographerName} />
                  ) : null}
                </div>
              </CardSection>
            )}

            {wedding.dogs.length > 0 ? (
              <CardSection title="Dogs">
                <ul className="space-y-2">
                  {wedding.dogs.map((dog, i) => (
                    <li key={i} className="text-sm text-sage-900">
                      <span className="font-semibold uppercase tracking-wider text-stone-500 text-xs">
                        Dog {i + 1}
                      </span>
                      <p>
                        {dog.name}
                        {dog.breed ? ` · ${dog.breed}` : ""}
                        {dog.age ? ` · ${dog.age}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 rounded-lg border border-blush-300 bg-blush-50 p-3 text-sm">
                  <span className="font-semibold text-sage-900">⚠ Allergies: </span>
                  <span className="text-sage-900">
                    {wedding.allergies?.trim() || "None known"}
                  </span>
                </div>

                {wedding.behaviorNotes ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Behavior Notes
                    </p>
                    <p className="mt-1 text-sm text-sage-900">
                      {wedding.behaviorNotes}
                    </p>
                  </div>
                ) : null}
              </CardSection>
            ) : null}

            {(wedding.pickupAddress ||
              wedding.dropoffAddress ||
              wedding.dayOfTimeline) && (
              <CardSection title="Logistics">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {wedding.pickupAddress ? (
                    <Field label="Pickup" value={wedding.pickupAddress} />
                  ) : null}
                  <Field
                    label="Dropoff"
                    value={wedding.dropoffAddress || "Same as pickup"}
                  />
                </div>
                {wedding.dayOfTimeline ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Timeline
                    </p>
                    <p className="mt-1 text-sm text-sage-900">
                      {wedding.dayOfTimeline}
                    </p>
                  </div>
                ) : null}
              </CardSection>
            )}

            {(wedding.hotelName || wedding.hotelAddress) && (
              <CardSection title="Hotel">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {wedding.hotelName ? (
                    <Field label="Hotel Name" value={wedding.hotelName} />
                  ) : null}
                  {wedding.hotelAddress ? (
                    <Field label="Hotel Address" value={wedding.hotelAddress} />
                  ) : null}
                </div>
              </CardSection>
            )}

            {wedding.miscellaneousNotes ? (
              <CardSection title="Notes">
                <p className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-sage-900">
                  {wedding.miscellaneousNotes}
                </p>
              </CardSection>
            ) : null}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

function ConfirmSummaryBadge({
  summary,
}: {
  summary: { assigned: number; confirmed: number };
}) {
  const allConfirmed =
    summary.assigned > 0 && summary.confirmed >= summary.assigned;
  return (
    <Badge tone={allConfirmed ? "confirmed" : "new"}>
      {allConfirmed ? "✓" : "⏳"} {summary.confirmed}/{summary.assigned} confirmed
    </Badge>
  );
}

function AdminConfirmationStatus({ wedding }: { wedding: Wedding }) {
  const { data: confirmations, isLoading } = useWeddingConfirmations(wedding.id);

  const primaryId = chaperoneId(wedding.primaryChaperone);
  const secondaryId = chaperoneId(wedding.secondaryChaperone);
  const primaryNameValue = chaperoneName(wedding.primaryChaperone);
  const secondaryNameValue = chaperoneName(wedding.secondaryChaperone);

  const confirmationFor = (userId: string | null): Confirmation | null => {
    if (!userId || !confirmations) return null;
    return (
      confirmations.find((c) => {
        const cUserId =
          typeof c.user === "string" ? c.user : c.user.id;
        return cUserId === userId;
      }) ?? null
    );
  };

  const rows: Array<{
    label: string;
    name: string | null;
    id: string | null;
  }> = [];

  if (primaryId) {
    rows.push({ label: "Primary", name: primaryNameValue, id: primaryId });
  }
  if (secondaryId) {
    rows.push({ label: "Secondary", name: secondaryNameValue, id: secondaryId });
  }

  return (
    <CardSection title="Team Confirmations">
      {isLoading ? (
        <p className="text-sm text-stone-500">Loading confirmations…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-stone-500">No chaperones assigned.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const confirmation = confirmationFor(row.id);
            return (
              <li
                key={row.id ?? row.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm"
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    {row.label}
                  </span>
                  <p className="text-sage-900">{row.name ?? "—"}</p>
                </div>
                <div className="text-right">
                  {confirmation ? (
                    <>
                      <Badge tone="confirmed">
                        ✓ Confirmed
                        {confirmation.autoConfirmed ? " (auto)" : ""}
                      </Badge>
                      <p className="mt-1 text-xs text-stone-500">
                        {format(
                          new Date(confirmation.confirmedAt),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </>
                  ) : (
                    <Badge tone="tentative">Pending</Badge>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CardSection>
  );
}

function toErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-sage-900">{value}</p>
    </div>
  );
}

function ContactBlock({
  label,
  name,
  phone,
}: {
  label: string;
  name: string;
  phone?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-sage-900">
        {name}
        {phone ? ` · ${phone}` : ""}
      </p>
    </div>
  );
}

function formatContact(name: string, phone?: string): string {
  return phone ? `${name} · ${phone}` : name;
}
