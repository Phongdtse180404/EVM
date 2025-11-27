import { Badge } from "@/components/ui/badge";
import type { VehicleStatus } from "@/services/api-electric-vehicle";

interface StatusBadgeProps {
  status: VehicleStatus;
}

const statusMap: Record<VehicleStatus, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Có sẵn",
    className: "bg-success/20 text-success border-success",
  },
  HOLD: {
    label: "Đang giữ",
    className: "bg-warning/20 text-warning border-warning",
  },
  UNDELIVERED: {
    label: "Chưa giao",
    className: "bg-purple-100 text-purple-700 border-purple-300",
  },
  DELIVERED: {
    label: "Đã giao",
    className: "bg-primary/20 text-primary border-primary",
  },
  DELIVERING: {
    label: "Đang giao",
    className: "bg-blue-100 text-blue-700 border-blue-300",
  },
  SOLD_OUT: {
    label: "Đã bán",
    className: "bg-destructive/20 text-destructive border-destructive",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const info = statusMap[status] || { label: status, className: "bg-muted/20 text-muted border-muted" };
  return (
    <Badge className={info.className}>{info.label}</Badge>
  );
}
