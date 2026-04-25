"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User, UserRole } from "@/types/api";

export interface OwnerInfo {
  id: string;
  name: string;
  phone: string | null;
}

export function useOwner() {
  return useQuery({
    queryKey: ["users", "owner"] as const,
    queryFn: async () => {
      const res = await api.get<OwnerInfo | null>("/users/owner");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUsers(filter?: { role?: UserRole; isActive?: boolean }) {
  return useQuery({
    queryKey: ["users", filter ?? {}] as const,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.role) params.set("role", filter.role);
      if (filter?.isActive !== undefined) {
        params.set("isActive", String(filter.isActive));
      }
      const qs = params.toString();
      const path = qs ? `/users?${qs}` : "/users";
      const res = await api.get<User[]>(path);
      return res.data;
    },
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<User>) => {
      const res = await api.patch<User>(`/users/${id}`, input);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
