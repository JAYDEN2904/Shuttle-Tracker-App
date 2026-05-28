import type { CapacityStatus } from "@shuttle/shared-types";
import { Badge } from "@/components/ui/Badge";

interface CapacityBadgeProps {
  status: CapacityStatus;
  size?: "sm" | "md";
}

const STATUS_LABELS: Record<CapacityStatus, string> = {
  available: "Available",
  half_full: "Half Full",
  full: "Full",
};

export function CapacityBadge({ status, size = "sm" }: CapacityBadgeProps) {
  return (
    <Badge
      label={STATUS_LABELS[status]}
      variant={status}
      size={size}
      dot
    />
  );
}
