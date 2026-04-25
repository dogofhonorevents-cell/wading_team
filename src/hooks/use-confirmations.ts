"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Confirmation } from "@/types/api";

export function useMyConfirmation(weddingId: string | null) {
  return useQuery({
    queryKey: weddingId
      ? (["confirmations", "wedding", weddingId, "me"] as const)
      : (["confirmations", "none"] as const),
    enabled: Boolean(weddingId),
    queryFn: async () => {
      const res = await api.get<Confirmation | null>(
        `/weddings/${weddingId}/my-confirmation`
      );
      return res.data;
    },
  });
}

export function useMyConfirmations() {
  return useQuery({
    queryKey: ["confirmations", "me"] as const,
    queryFn: async () => {
      const res = await api.get<Confirmation[]>("/confirmations/me");
      return res.data;
    },
  });
}

export function useAllConfirmations() {
  return useQuery({
    queryKey: ["confirmations", "all"] as const,
    queryFn: async () => {
      const res = await api.get<Confirmation[]>("/confirmations");
      return res.data;
    },
  });
}

export function useWeddingConfirmations(weddingId: string | null) {
  return useQuery({
    queryKey: weddingId
      ? (["confirmations", "wedding", weddingId, "all"] as const)
      : (["confirmations", "none"] as const),
    enabled: Boolean(weddingId),
    queryFn: async () => {
      const res = await api.get<Confirmation[]>(
        `/weddings/${weddingId}/confirmations`
      );
      return res.data;
    },
  });
}

export function useConfirmWedding(weddingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<Confirmation>(
        `/weddings/${weddingId}/confirm`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["confirmations"] });
      qc.invalidateQueries({ queryKey: ["weddings"] });
    },
  });
}
