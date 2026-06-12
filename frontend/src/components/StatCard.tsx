import { useEffect, useMemo, useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  color?: string;
}

function parseDisplayValue(input: string | number) {
  if (typeof input === "number") {
    return { type: "number" as const, raw: input, prefix: "", suffix: "" };
  }

  const trimmed = String(input).trim();
  if (/^₹/.test(trimmed)) {
    const numeric = Number(trimmed.replace(/[₹,%\s,]/g, ""));
    if (!Number.isNaN(numeric)) {
      return { type: "currency" as const, raw: numeric, prefix: "₹", suffix: "" };
    }
  }

  if (/%$/.test(trimmed)) {
    const numeric = Number(trimmed.replace(/[₹,%\s,]/g, ""));
    if (!Number.isNaN(numeric)) {
      return { type: "percent" as const, raw: numeric, prefix: "", suffix: "%" };
    }
  }

  const numeric = Number(trimmed.replace(/[₹,%\s,]/g, ""));
  if (!Number.isNaN(numeric) && /\d/.test(trimmed)) {
    return { type: "number" as const, raw: numeric, prefix: "", suffix: "" };
  }

  return { type: "text" as const, raw: 0, prefix: "", suffix: trimmed };
}

export default function StatCard({ label, value, icon, trend, color = "accent" }: StatCardProps) {
  const palette: Record<string, { border: string; text: string; glow: string; soft: string }> = {
    accent: {
      border: "rgba(47, 93, 138, 0.4)",
      text: "#2f5d8a",
      glow: "rgba(47, 93, 138, 0.35)",
      soft: "rgba(47, 93, 138, 0.12)",
    },
    primary: {
      border: "rgba(94, 217, 215, 0.35)",
      text: "#5ed9d7",
      glow: "rgba(94, 217, 215, 0.26)",
      soft: "rgba(94, 217, 215, 0.1)",
    },
    resolved: {
      border: "rgba(102, 217, 160, 0.35)",
      text: "#66d9a0",
      glow: "rgba(102, 217, 160, 0.24)",
      soft: "rgba(102, 217, 160, 0.1)",
    },
    critical: {
      border: "rgba(255, 107, 107, 0.35)",
      text: "#ff6b6b",
      glow: "rgba(255, 107, 107, 0.24)",
      soft: "rgba(255, 107, 107, 0.1)",
    },
    warning: {
      border: "rgba(240, 198, 116, 0.35)",
      text: "#f0c674",
      glow: "rgba(240, 198, 116, 0.24)",
      soft: "rgba(240, 198, 116, 0.1)",
    },
  };

  const theme = palette[color] || palette.accent;
  const parsed = useMemo(() => parseDisplayValue(value), [value]);
  const [displayNumber, setDisplayNumber] = useState(0);

  useEffect(() => {
    if (parsed.type === "text") return;

    let frame = 0;
    const duration = 850;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNumber(parsed.raw * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [parsed.raw, parsed.type]);

  const formattedValue = useMemo(() => {
    if (parsed.type === "text") return parsed.suffix;
    if (parsed.type === "currency") {
      return `${parsed.prefix}${Math.round(displayNumber).toLocaleString("en-IN")}`;
    }
    if (parsed.type === "percent") {
      return `${Math.round(displayNumber)}${parsed.suffix}`;
    }
    return Math.round(displayNumber).toLocaleString("en-IN");
  }, [displayNumber, parsed]);

  return (
    <div
      className="surface-panel surface-hover rounded-2xl p-5 relative overflow-hidden soft-rise"
      style={{ animationDelay: "40ms" }}
    >
      <div
        className="absolute left-0 right-0 top-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, ${theme.border}, ${theme.text}, transparent)`,
          boxShadow: `0 0 14px ${theme.glow}`,
        }}
      />

      <div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl"
        style={{ background: theme.soft }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mono-label text-slate-400 mb-2">{label}</p>
          <p className="metric-value text-[30px] sm:text-[34px] leading-none font-bold text-white truncate">
            {formattedValue}
          </p>
          {trend && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/[0.03] border border-white/6 px-2.5 py-1">
              <span className="text-[11px]" style={{ color: theme.text }}>
                ↗
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{trend}</span>
            </div>
          )}
        </div>

        <div className="shrink-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-white/6"
            style={{
              background: `linear-gradient(145deg, rgba(255,255,255,0.03), ${theme.soft})`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 6px 18px rgba(0,0,0,0.16)`,
            }}
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
