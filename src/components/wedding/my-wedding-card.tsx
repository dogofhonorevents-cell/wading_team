"use client";

import { Calendar, Lock, MapPin, PawPrint, Star } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardSection } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { useConfirmWedding, useMyConfirmation } from "@/hooks/use-confirmations";
import { useOwner } from "@/hooks/use-users";
import { ApiError } from "@/lib/api";
import type { ChaperoneRef, ChaperoneRole, Wedding } from "@/types/api";

function chaperoneId(ref: string | ChaperoneRef | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  return ref.id ?? ref._id ?? null;
}

function chaperoneName(ref: string | ChaperoneRef | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === "string") return null;
  return ref.name ?? ref.email ?? null;
}

function findMyRole(
  wedding: Wedding,
  userId: string
): ChaperoneRole | null {
  if (chaperoneId(wedding.primaryChaperone) === userId) return "primary";
  if (chaperoneId(wedding.secondaryChaperone) === userId) return "secondary";
  return null;
}

function formatDate(iso?: string, pattern = "EEE, MMM d, yyyy"): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), pattern);
  } catch {
    return "—";
  }
}

export function MyWeddingCard({
  wedding,
  currentUserId,
}: {
  wedding: Wedding;
  currentUserId: string;
}) {
  const myRole = findMyRole(wedding, currentUserId);

  if (!myRole) return null;

  if (wedding.status === "tentative") {
    return <TentativeCard wedding={wedding} myRole={myRole} />;
  }

  return <BookedCard wedding={wedding} myRole={myRole} />;
}

function RoleBadge({ role }: { role: ChaperoneRole | null }) {
  if (role === "primary") {
    return (
      <Badge tone="primary" className="gap-1">
        <Star className="h-3 w-3 fill-current" />
        Primary
      </Badge>
    );
  }
  if (role === "secondary") {
    return <Badge tone="secondary">Secondary</Badge>;
  }
  return null;
}

function TentativeCard({
  wedding,
  myRole,
}: {
  wedding: Wedding;
  myRole: ChaperoneRole | null;
}) {
  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl text-sage-900">
              {wedding.person1Name} & {wedding.person2Name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status="tentative" />
              <RoleBadge role={myRole} />
            </div>
          </div>
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
        </div>

        <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
          This wedding is tentative — full details become visible once the owner
          marks it as booked.
        </p>
      </CardBody>
    </Card>
  );
}

function BookedCard({
  wedding,
  myRole,
}: {
  wedding: Wedding;
  myRole: ChaperoneRole | null;
}) {
  const { data: myConfirmation, isLoading } = useMyConfirmation(wedding.id);
  const confirm = useConfirmWedding(wedding.id);
  const { data: owner } = useOwner();
  const [error, setError] = useState<string | null>(null);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  // Watch the sentinel placed just above the confirm button. Once it enters
  // the viewport even once, the user has scrolled the whole wedding details,
  // so the Confirm button becomes active.
  useEffect(() => {
    if (myConfirmation || hasReachedBottom) return;
    const node = bottomSentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasReachedBottom(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [myConfirmation, hasReachedBottom]);

  const dogNames = wedding.dogs.map((d) => d.name).filter(Boolean);
  const ownerName = owner?.name?.trim() || "the owner";

  const handleConfirm = async () => {
    setError(null);
    try {
      await confirm.mutateAsync();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Could not confirm"
      );
    }
  };

  return (
    <Card className="border-blush-300">
      <CardBody className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl text-sage-900">
              {wedding.person1Name} & {wedding.person2Name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RoleBadge role={myRole} />
            </div>
          </div>

          <div className="text-right">
            {isLoading ? (
              <span className="text-xs text-stone-400">…</span>
            ) : myConfirmation ? (
              <div>
                <Badge tone="confirmed">✓ Confirmed</Badge>
                <p className="mt-1 text-xs text-stone-500">
                  {format(new Date(myConfirmation.confirmedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            ) : null}
          </div>
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

        {!isLoading && !myConfirmation ? (
          <p className="rounded-lg border border-blush-200 bg-blush-50 px-3 py-2 text-center text-xs text-sage-700">
            Please scroll through the full event details below before
            committing.
          </p>
        ) : null}

        <CardSection title="Chaperone Roles">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Badge tone="primary">★ Primary</Badge>
              <p className="mt-2 text-sm text-sage-900">
                {chaperoneName(wedding.primaryChaperone) ?? "—"}
              </p>
            </div>
            <div>
              <Badge tone="secondary">Secondary</Badge>
              <p className="mt-2 text-sm text-sage-900">
                {chaperoneName(wedding.secondaryChaperone) ?? "— None —"}
              </p>
            </div>
          </div>
        </CardSection>

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

        {(wedding.plannerName ||
          wedding.photographerName ||
          wedding.videographerName) && (
          <CardSection title="Vendors">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {wedding.plannerName ? (
                <Field
                  label="Planner"
                  value={formatContact(wedding.plannerName, wedding.plannerPhone)}
                />
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
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

        {(wedding.pickupAddress || wedding.dayOfTimeline) && (
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

        {/* Sentinel — when this is in view we know the team member has
            scrolled through every detail above. */}
        <div ref={bottomSentinelRef} aria-hidden="true" />

        {!isLoading && !myConfirmation ? (
          <div className="space-y-2 border-t border-stone-200 pt-4">
            <Button
              onClick={handleConfirm}
              loading={confirm.isPending}
              disabled={!hasReachedBottom || confirm.isPending}
              size="lg"
              className="w-full"
            >
              {hasReachedBottom
                ? "I commit to chaperoning this event"
                : "Scroll up to read all details first"}
            </Button>
            {error ? (
              <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <p className="text-center text-xs text-stone-500">
              Tapping commit locks you in — it cannot be undone.
            </p>
          </div>
        ) : myConfirmation ? (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">
                Your commitment to chaperoning for this event has been
                confirmed.
              </p>
              <p className="mt-1">
                Call {ownerName}
                {owner?.phone ? ` (${owner.phone})` : ""} ASAP if you must
                cancel.
              </p>
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
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

function formatContact(name: string, phone?: string): string {
  return phone ? `${name} · ${phone}` : name;
}
