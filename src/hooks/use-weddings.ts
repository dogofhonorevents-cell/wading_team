"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Wedding, WeddingStatus } from "@/types/api";

const KEYS = {
  list: (filter?: { status?: WeddingStatus; assignedTo?: string }) =>
    ["weddings", filter ?? {}] as const,
  detail: (id: string) => ["weddings", id] as const,
};

export function useWeddings(filter?: {
  status?: WeddingStatus;
  assignedTo?: string;
}) {
  return useQuery({
    queryKey: KEYS.list(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.status) params.set("status", filter.status);
      if (filter?.assignedTo) params.set("assignedTo", filter.assignedTo);
      const qs = params.toString();
      const path = qs ? `/weddings?${qs}` : "/weddings";
      const res = await api.get<Wedding[]>(path);
      return res.data;
    },
  });
}

export function useWedding(id: string | null) {
  return useQuery({
    queryKey: id ? KEYS.detail(id) : ["weddings", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get<Wedding>(`/weddings/${id}`);
      return res.data;
    },
  });
}

export function useCreateWedding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Wedding>) => {
      const res = await api.post<Wedding>("/weddings", input);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weddings"] });
      qc.invalidateQueries({ queryKey: ["confirmations"] });
    },
  });
}

export function useUpdateWedding(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Wedding>) => {
      const res = await api.patch<Wedding>(`/weddings/${id}`, input);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weddings"] });
      qc.invalidateQueries({ queryKey: ["confirmations"] });
    },
  });
}

export function useToggleWeddingStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: WeddingStatus) => {
      const res = await api.patch<Wedding>(`/weddings/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weddings"] });
      qc.invalidateQueries({ queryKey: ["confirmations"] });
    },
  });
}

export function useDeleteWedding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/weddings/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weddings"] });
      qc.invalidateQueries({ queryKey: ["confirmations"] });
    },
  });
}
