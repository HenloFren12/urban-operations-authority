interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  "in progress": "bg-primary/12 text-accent border-primary/22",
  in_progress: "bg-primary/12 text-accent border-primary/22",
  assigned: "bg-primary/12 text-accent border-primary/22",
  resolved: "bg-resolved/10 text-resolved border-resolved/20",
  completed: "bg-resolved/10 text-resolved border-resolved/20",
  closed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  critical: "bg-critical/10 text-critical border-critical/20",
  high: "bg-critical/10 text-critical border-critical/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-resolved/10 text-resolved border-resolved/20",
  open: "bg-accent/10 text-accent border-accent/20",
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = status?.toLowerCase() || "pending";
  const style = statusStyles[normalized] || "bg-slate-500/10 text-slate-400 border-slate-500/20";

  const dotClass =
    normalized.includes("progress") || normalized === "assigned" || normalized === "in_progress"
      ? "bg-accent pulse-dot"
      : normalized === "resolved" || normalized === "completed"
        ? "bg-resolved"
        : normalized === "critical" || normalized === "high"
          ? "bg-critical pulse-dot"
          : normalized === "pending" || normalized === "medium"
            ? "bg-warning"
            : "bg-slate-400";

  return (
    <span
      className={`badge-animate inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold uppercase tracking-[0.08em] border backdrop-blur-[2px] ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {status}
    </span>
  );
}
