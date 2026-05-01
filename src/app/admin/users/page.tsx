"use client";

import Link from "next/link";
import { Check, ChevronLeft, Power, PowerOff, Star } from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Card, CardBody } from "@/components/ui/card";
import { useUpdateUser, useUsers } from "@/hooks/use-users";
import { useAuth } from "@/providers/auth-provider";
import { ApiError } from "@/lib/api";
import type { User, UserRole } from "@/types/api";

export default function UsersPage() {
  const { data, isLoading, error } = useUsers();
  const { user: currentUser } = useAuth();

  const users = data ?? [];

  const { pending, approved } = useMemo(() => {
    const pending: User[] = [];
    const approved: User[] = [];
    for (const u of users) {
      if (u.isActive) approved.push(u);
      else pending.push(u);
    }
    return { pending, approved };
  }, [users]);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-medium text-sage-700 hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="font-serif text-3xl text-sage-900">Manage Team</h1>
        <p className="mt-1 text-sm text-stone-600">
          New team members must sign up themselves on the login page. Their
          accounts then appear here for you to approve before they can access
          the app or be assigned to weddings.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
          Loading team…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load team:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-stone-600">
              No team members yet. Share the login URL with the people you want
              to invite. Once they sign up, they&apos;ll show up here for
              approval.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl text-sage-900">
                  Awaiting Approval
                </h2>
                <span className="inline-flex items-center justify-center rounded-full bg-blush-300 px-2.5 py-0.5 text-xs font-semibold text-sage-900">
                  {pending.length}
                </span>
              </div>
              <p className="text-sm text-stone-600">
                These people signed up but can&apos;t use the app or be assigned
                to weddings until you approve them.
              </p>
              {pending.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  isSelf={currentUser?.id === u.id}
                />
              ))}
            </section>
          ) : null}

          {approved.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-serif text-xl text-sage-900">Team Members</h2>
              {approved.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  isSelf={currentUser?.id === u.id}
                />
              ))}
            </section>
          ) : null}
        </div>
      )}
    </main>
  );
}

function UserRow({ user, isSelf }: { user: User; isSelf: boolean }) {
  const updateUser = useUpdateUser(user.id);
  const [error, setError] = useState<string | null>(null);

  const hasLoggedIn = Boolean(user.lastLoginAt);
  const isPending = !user.isActive && !hasLoggedIn;
  const isDeactivated = !user.isActive && hasLoggedIn;

  const lastLogin = user.lastLoginAt
    ? format(new Date(user.lastLoginAt), "MMM d, yyyy 'at' h:mm a")
    : "Never logged in";

  const handleRoleChange = async (role: UserRole) => {
    if (role === user.role) return;
    setError(null);
    try {
      await updateUser.mutateAsync({ role });
    } catch (err) {
      setError(readError(err));
    }
  };

  const handleToggleActive = async () => {
    setError(null);
    try {
      await updateUser.mutateAsync({ isActive: !user.isActive });
    } catch (err) {
      setError(readError(err));
    }
  };

  return (
    <Card
      className={
        isPending
          ? "border-blush-300 bg-blush-50/40"
          : user.isActive
          ? ""
          : "opacity-70"
      }
    >
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-serif text-lg text-sage-900">
              {user.name}
              {isSelf ? (
                <span className="ml-2 text-xs font-medium text-sage-700">
                  (you)
                </span>
              ) : null}
            </p>
            {user.role === "admin" ? (
              <Badge tone="primary" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                Owner
              </Badge>
            ) : (
              <Badge tone="secondary">Team Member</Badge>
            )}
            {isPending ? (
              <Badge tone="new">⏳ Pending Approval</Badge>
            ) : isDeactivated ? (
              <Badge tone="neutral">Deactivated</Badge>
            ) : (
              <Badge tone="confirmed">Active</Badge>
            )}
          </div>

          <p className="text-sm text-stone-600">{user.email}</p>
          {user.phone ? (
            <p className="text-sm text-stone-600">{user.phone}</p>
          ) : null}
          <p className="text-xs text-stone-500">Last login: {lastLogin}</p>

          {error ? (
            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:w-56">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Role
          </label>
          <Select
            value={user.role}
            disabled={updateUser.isPending || isSelf}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          >
            <option value="admin">Owner (admin)</option>
            <option value="team_member">Team member</option>
          </Select>
          {isSelf ? (
            <p className="text-xs text-stone-500">
              You can&rsquo;t change your own role.
            </p>
          ) : null}

          <button
            type="button"
            disabled={updateUser.isPending || isSelf}
            onClick={handleToggleActive}
            className={`mt-2 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isPending
                ? "border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700"
                : user.isActive
                ? "border-red-200 bg-white text-red-700 hover:bg-red-50"
                : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {isPending ? (
              <>
                <Check className="h-4 w-4" /> Approve
              </>
            ) : user.isActive ? (
              <>
                <PowerOff className="h-4 w-4" /> Deactivate
              </>
            ) : (
              <>
                <Power className="h-4 w-4" /> Reactivate
              </>
            )}
          </button>
        </div>
      </CardBody>
    </Card>
  );
}

function readError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Unknown error";
}
