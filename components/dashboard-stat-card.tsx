import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  variant?: "default" | "accent" | "success";
}

export default function StatCard({
  label,
  value,
  sublabel,
  icon,
  variant = "default",
}: StatCardProps) {
  const bgColorClass =
    variant === "accent"
      ? "bg-secondary/10"
      : variant === "success"
        ? "bg-green-50"
        : "bg-muted";

  const borderClass =
    variant === "accent"
      ? "border-secondary/20"
      : variant === "success"
        ? "border-green-200"
        : "border-border";

  return (
    <div
      className={`rounded-lg border ${borderClass} ${bgColorClass} p-6 space-y-2`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            {label}
          </p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
          )}
        </div>
        {icon && <div className="text-gold">{icon}</div>}
      </div>
    </div>
  );
}
