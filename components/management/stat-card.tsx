import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  variant?: "default" | "gold" | "success" | "destructive";
}

export default function StatCard({
  label,
  value,
  sublabel,
  icon,
  variant = "default",
}: StatCardProps) {
  return (
    <div className="rounded-md bg-card p-6 space-y-2 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold truncate">
            {label}
          </p>
          <p
            className={cn(
              "text-2xl sm:text-3xl font-bold mt-2 truncate",
              variant === "gold" && "text-gold",
              variant === "success" && "text-emerald-700",
              variant === "destructive" && "text-red-600",
              variant === "default" && "text-foreground",
            )}
            title={value.toString()}
          >
            {value}
          </p>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{sublabel}</p>
          )}
        </div>
        {icon && <div className="text-gold shrink-0">{icon}</div>}
      </div>
    </div>
  );
}
