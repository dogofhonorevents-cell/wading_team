export type UserRole = "admin" | "team_member";

export type WeddingStatus = "tentative" | "booked";

export type ChaperoneRole = "primary" | "secondary";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dog {
  name: string;
  breed?: string;
  age?: string;
}

export interface ChaperoneRef {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Wedding {
  id: string;
  person1Name: string;
  person1Phone?: string;
  person2Name: string;
  person2Phone?: string;
  weddingDate: string;
  venue: string;
  status: WeddingStatus;

  primaryChaperone: string | ChaperoneRef;
  secondaryChaperone?: string | ChaperoneRef;

  plannerName?: string;
  plannerPhone?: string;
  photographerName?: string;
  videographerName?: string;

  dogs: Dog[];
  allergies?: string;
  behaviorNotes?: string;

  pickupAddress?: string;
  dropoffAddress?: string;
  dayOfTimeline?: string;

  hotelName?: string;
  hotelAddress?: string;

  miscellaneousNotes?: string;

  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Confirmation {
  id: string;
  wedding: string | Pick<Wedding, "id" | "person1Name" | "person2Name" | "weddingDate" | "venue" | "status">;
  user: string | Pick<User, "id" | "name" | "email" | "role">;
  role: ChaperoneRole;
  confirmedAt: string;
  seenByAdmin: boolean;
  autoConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}
