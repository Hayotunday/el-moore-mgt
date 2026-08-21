import { Badge, type BadgeProps } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, NonNullable<BadgeProps["variant"]>> = {
  AVAILABLE: "success",
  RESERVED: "warning",
  SOLD: "gold",
  PAID: "success",
  PENDING: "warning",
  FAILED: "destructive",
  SENT: "success",
  OUTRIGHT: "default",
  INSTALLMENT: "gold",
  INCOME: "success",
  EXPENSE: "destructive",
  OVERDUE: "destructive",
  PUBLISHED: "success",
  DRAFT: "neutral",
  DONE: "success",
};

export default function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_VARIANTS[status.toUpperCase()] ?? "neutral";
  return <Badge variant={variant}>{formatLabel(status)}</Badge>;
}

function formatLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}
