"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Confirmation } from "@/types/api";

interface NotificationsMeta {
  count: number;
  unreadCount: number;
}

interface NotificationsResponse {
  data: Confirmation[];
  meta?: NotificationsMeta;
}

export function useNotifications(options: { onlyUnread?: boolean } = {}) {
  return useQuery({
    queryKey: ["notifications", options] as const,
    queryFn: async (): Promise<NotificationsResponse> => {
      const params = new URLSearchParams();
      if (options.onlyUnread) params.set("onlyUnread", "true");
      const qs = params.toString();
      const path = qs ? `/notifications?${qs}` : "/notifications";
      const res = await api.get<Confirmation[]>(path);
      return {
        data: res.data,
        meta: res.meta as NotificationsMeta | undefined,
      };
    },
    refetchInterval: 60_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"] as const,
    queryFn: async () => {
      const res = await api.get<{ count: number }>("/notifications/unread-count");
      return res.data.count;
    },
    refetchInterval: 30_000,
  });
}

export function useMarkAllSeen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.patch<{ modifiedCount: number }>(
        "/notifications/mark-all-seen"
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
