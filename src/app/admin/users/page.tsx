"use client";

import Link from "next/link";
import { ChevronLeft, Power, PowerOff, Star } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
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
        <h1 className="font-serif text-3xl text-navy-900">Manage Team</h1>
        <p className="mt-1 text-sm text-stone-600">
          New team members appear here automatically the first time they log in.
          Give them the login URL, and they sign up with their own email and password.
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
              No team members yet. Share the login URL with the people you want to invite.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              isSelf={currentUser?.id === u.id}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function UserRow({ user, isSelf }: { user: User; isSelf: boolean }) {
  const updateUser = useUpdateUser(user.id);
  const [error, setError] = useState<string | null>(null);

  const lastLogin = user.lastLoginAt
    ? format(new Date(user.lastLoginAt), "MMM d, yyyy 'at' h:mm a")
    : "Never";

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
    <Card className={user.isActive ? "" : "opacity-70"}>
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-serif text-lg text-navy-900">
              {user.name}
              {isSelf ? (
                <span className="ml-2 text-xs font-medium text-navy-700">
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
            {user.isActive ? (
              <Badge tone="confirmed">Active</Badge>
            ) : (
              <Badge tone="neutral">Inactive</Badge>
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
              user.isActive
                ? "border-red-200 bg-white text-red-700 hover:bg-red-50"
                : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {user.isActive ? (
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
