"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useFieldArray, useForm, type SubmitHandler } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUsers } from "@/hooks/use-users";
import { useAuth } from "@/providers/auth-provider";
import {
  emptyWeddingForm,
  sanitizeForApi,
  sanitizeForUpdate,
  weddingFormSchema,
  type WeddingFormValues,
} from "@/lib/wedding-schema";
import type { User } from "@/types/api";

interface WeddingFormProps {
  defaultValues?: Partial<WeddingFormValues>;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
  mode?: "create" | "update";
}

export function WeddingForm({
  defaultValues,
  onSubmit,
  submitLabel = "Create Wedding",
  mode = "create",
}: WeddingFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WeddingFormValues>({
    resolver: zodResolver(weddingFormSchema),
    defaultValues: { ...emptyWeddingForm, ...defaultValues },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "dogs" });

  const { data: users, isLoading: loadingUsers } = useUsers({ isActive: true });
  const { user: currentUser } = useAuth();

  const orderedUsers = useMemo(
    () => orderUsersWithMeFirst(users, currentUser),
    [users, currentUser]
  );

  const submit: SubmitHandler<WeddingFormValues> = async (values) => {
    const payload = mode === "update" ? sanitizeForUpdate(values) : sanitizeForApi(values);
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <Card>
        <CardBody className="space-y-5">
          <SectionTitle>Couple</SectionTitle>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Person 1 Name" error={errors.person1Name?.message}>
              <Input {...register("person1Name")} invalid={Boolean(errors.person1Name)} />
            </Field>
            <Field label="Person 1 Phone" error={errors.person1Phone?.message}>
              <Input
                type="tel"
                placeholder="415-555-0100"
                {...register("person1Phone")}
              />
            </Field>
            <Field label="Person 2 Name" error={errors.person2Name?.message}>
              <Input {...register("person2Name")} invalid={Boolean(errors.person2Name)} />
            </Field>
            <Field label="Person 2 Phone">
              <Input
                type="tel"
                placeholder="415-555-0100"
                {...register("person2Phone")}
              />
            </Field>
            <Field label="Wedding Date" error={errors.weddingDate?.message}>
              <Input
                type="date"
                {...register("weddingDate")}
                invalid={Boolean(errors.weddingDate)}
              />
            </Field>
            <Field label="Status">
              <Select {...register("status")}>
                <option value="tentative">Tentative</option>
                <option value="booked">Booked</option>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Venue" error={errors.venue?.message}>
                <Input {...register("venue")} invalid={Boolean(errors.venue)} />
              </Field>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <SectionTitle>Chaperone Roles</SectionTitle>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="★ Primary Chaperone"
              error={errors.primaryChaperone?.message}
            >
              <Select
                {...register("primaryChaperone")}
                invalid={Boolean(errors.primaryChaperone)}
                disabled={loadingUsers}
              >
                <option value="">— Select —</option>
                {orderedUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {labelForUser(u, currentUser?.id)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Secondary Chaperone"
              error={errors.secondaryChaperone?.message}
              hint="Optional"
            >
              <Select
                {...register("secondaryChaperone")}
                disabled={loadingUsers}
                invalid={Boolean(errors.secondaryChaperone)}
              >
                <option value="">— None —</option>
                {orderedUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {labelForUser(u, currentUser?.id)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <SectionTitle>Vendors</SectionTitle>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Planner Name">
              <Input {...register("plannerName")} />
            </Field>
            <Field label="Planner Phone">
              <Input type="tel" {...register("plannerPhone")} />
            </Field>
            <Field label="Photographer">
              <Input {...register("photographerName")} />
            </Field>
            <Field label="Videographer">
              <Input {...register("videographerName")} />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-center justify-between">
            <SectionTitle>Dogs</SectionTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={fields.length >= 3}
              onClick={() => append({ name: "", breed: "", age: "" })}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add dog
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-stone-500">
              No dogs added yet. Click &ldquo;Add dog&rdquo; (up to 3).
            </p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, i) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Dog {i + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field label="Name">
                      <Input {...register(`dogs.${i}.name` as const)} />
                    </Field>
                    <Field label="Breed">
                      <Input {...register(`dogs.${i}.breed` as const)} />
                    </Field>
                    <Field label="Age">
                      <Input
                        placeholder="e.g. 3 yrs"
                        {...register(`dogs.${i}.age` as const)}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Field label="Allergies" hint="Shown as a highlighted warning to team">
            <Textarea rows={2} {...register("allergies")} />
          </Field>

          <Field label="Behavior Notes">
            <Textarea
              rows={3}
              placeholder="Leash requirements, anxiety triggers, special instructions…"
              {...register("behaviorNotes")}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <SectionTitle>Logistics</SectionTitle>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Pickup Address">
              <Input {...register("pickupAddress")} />
            </Field>
            <Field label="Dropoff Address" hint="Leave blank if same as pickup">
              <Input {...register("dropoffAddress")} />
            </Field>
          </div>

          <Field label="Day-of Timeline">
            <Textarea
              rows={2}
              placeholder="e.g. 10am pickup → 12pm ceremony → 2pm photos → 4pm dropoff"
              {...register("dayOfTimeline")}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <SectionTitle>Hotel (optional)</SectionTitle>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Hotel Name">
              <Input {...register("hotelName")} />
            </Field>
            <Field label="Hotel Address">
              <Input {...register("hotelAddress")} />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <SectionTitle>Notes</SectionTitle>

          <Field label="Miscellaneous Notes">
            <Textarea rows={4} {...register("miscellaneousNotes")} />
          </Field>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function orderUsersWithMeFirst(
  users: User[] | undefined,
  me: User | null | undefined
): User[] {
  if (!users) return [];
  if (!me) return users;
  const meUser = users.find((u) => u.id === me.id);
  if (!meUser) return users;
  const rest = users.filter((u) => u.id !== me.id);
  return [meUser, ...rest];
}

function labelForUser(user: User, myId: string | undefined): string {
  if (user.id === myId && user.role === "admin") return `★ Me (Owner)`;
  if (user.role === "admin") return `${user.name} (Owner)`;
  return user.name;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-navy-700">
      {children}
    </p>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
}
