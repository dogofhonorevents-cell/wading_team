import { Badge } from "@/components/ui/badge";
import type { WeddingStatus } from "@/types/api";

export function StatusBadge({ status }: { status: WeddingStatus }) {
  if (status === "booked") {
    return <Badge tone="booked">✓ Booked</Badge>;
  }
  return <Badge tone="tentative">○ Tentative</Badge>;
}
