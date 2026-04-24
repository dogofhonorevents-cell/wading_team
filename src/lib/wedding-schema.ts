import { z } from "zod";
import type { ChaperoneRef, Wedding } from "@/types/api";

const objectIdRegex = /^[a-f\d]{24}$/i;

export const dogFormSchema = z.object({
  name: z.string().trim(),
  breed: z.string().trim(),
  age: z.string().trim(),
});

export const weddingFormSchema = z.object({
  person1Name: z.string().trim().min(1, "Required"),
  person1Phone: z.string().trim(),
  person2Name: z.string().trim().min(1, "Required"),
  person2Phone: z.string().trim(),
  weddingDate: z.string().min(1, "Wedding date is required"),
  venue: z.string().trim().min(1, "Required"),
  status: z.enum(["tentative", "booked"]),

  primaryChaperone: z
    .string()
    .regex(objectIdRegex, "Choose a primary chaperone"),
  secondaryChaperone: z
    .string()
    .refine((v) => v === "" || objectIdRegex.test(v), "Invalid selection"),

  plannerName: z.string().trim(),
  plannerPhone: z.string().trim(),
  photographerName: z.string().trim(),
  videographerName: z.string().trim(),

  dogs: z.array(dogFormSchema).max(3),

  allergies: z.string().trim(),
  behaviorNotes: z.string().trim(),

  pickupAddress: z.string().trim(),
  dropoffAddress: z.string().trim(),
  dayOfTimeline: z.string().trim(),

  hotelName: z.string().trim(),
  hotelAddress: z.string().trim(),

  miscellaneousNotes: z.string().trim(),
});

export type WeddingFormValues = z.infer<typeof weddingFormSchema>;

export const emptyWeddingForm: WeddingFormValues = {
  person1Name: "",
  person1Phone: "",
  person2Name: "",
  person2Phone: "",
  weddingDate: "",
  venue: "",
  status: "tentative",
  primaryChaperone: "",
  secondaryChaperone: "",
  plannerName: "",
  plannerPhone: "",
  photographerName: "",
  videographerName: "",
  dogs: [],
  allergies: "",
  behaviorNotes: "",
  pickupAddress: "",
  dropoffAddress: "",
  dayOfTimeline: "",
  hotelName: "",
  hotelAddress: "",
  miscellaneousNotes: "",
};

const stringKeysToClean = new Set([
  "person1Phone",
  "person2Phone",
  "plannerName",
  "plannerPhone",
  "photographerName",
  "videographerName",
  "allergies",
  "behaviorNotes",
  "pickupAddress",
  "dropoffAddress",
  "dayOfTimeline",
  "hotelName",
  "hotelAddress",
  "miscellaneousNotes",
  "secondaryChaperone",
]);

export function sanitizeForApi(values: WeddingFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values)) {
    if (key === "dogs") continue;
    if (stringKeysToClean.has(key)) {
      if (typeof value === "string" && value.trim() === "") continue;
    }
    payload[key] = value;
  }

  const cleanDogs = values.dogs
    .filter((d) => d.name.trim().length > 0)
    .map((d) => ({
      name: d.name.trim(),
      ...(d.breed.trim() ? { breed: d.breed.trim() } : {}),
      ...(d.age.trim() ? { age: d.age.trim() } : {}),
    }));

  if (cleanDogs.length > 0) payload.dogs = cleanDogs;

  return payload;
}

export function sanitizeForUpdate(values: WeddingFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values)) {
    if (key === "dogs") continue;
    payload[key] = value;
  }

  payload.dogs = values.dogs
    .filter((d) => d.name.trim().length > 0)
    .map((d) => ({
      name: d.name.trim(),
      ...(d.breed.trim() ? { breed: d.breed.trim() } : {}),
      ...(d.age.trim() ? { age: d.age.trim() } : {}),
    }));

  return payload;
}

function chaperoneIdOf(ref: string | ChaperoneRef | undefined): string {
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  return ref.id ?? ref._id ?? "";
}

function dateToInput(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function weddingToFormValues(wedding: Wedding): WeddingFormValues {
  return {
    person1Name: wedding.person1Name ?? "",
    person1Phone: wedding.person1Phone ?? "",
    person2Name: wedding.person2Name ?? "",
    person2Phone: wedding.person2Phone ?? "",
    weddingDate: dateToInput(wedding.weddingDate),
    venue: wedding.venue ?? "",
    status: wedding.status ?? "tentative",
    primaryChaperone: chaperoneIdOf(wedding.primaryChaperone),
    secondaryChaperone: chaperoneIdOf(wedding.secondaryChaperone),
    plannerName: wedding.plannerName ?? "",
    plannerPhone: wedding.plannerPhone ?? "",
    photographerName: wedding.photographerName ?? "",
    videographerName: wedding.videographerName ?? "",
    dogs: (wedding.dogs ?? []).map((d) => ({
      name: d.name ?? "",
      breed: d.breed ?? "",
      age: d.age ?? "",
    })),
    allergies: wedding.allergies ?? "",
    behaviorNotes: wedding.behaviorNotes ?? "",
    pickupAddress: wedding.pickupAddress ?? "",
    dropoffAddress: wedding.dropoffAddress ?? "",
    dayOfTimeline: wedding.dayOfTimeline ?? "",
    hotelName: wedding.hotelName ?? "",
    hotelAddress: wedding.hotelAddress ?? "",
    miscellaneousNotes: wedding.miscellaneousNotes ?? "",
  };
}
