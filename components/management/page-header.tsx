import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  eyebrow?: string;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  eyebrow = "El-Moore Management",
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold mb-2">
          {eyebrow}
        </p>
        <div className="w-10 h-0.5 bg-gold/40 mb-3" />
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-muted-foreground mt-2 max-w-xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
