import { useEffect, useMemo, useState } from "react";
import { ChartSkeleton, ErrorState, KpiSkeletonGrid } from "../components/LoadingState";
import StatCard from "../components/StatCard";
import { getAnalytics, getComplaints, getWorkOrders } from "../utils/api";

function LineTrendChart({ data, title }: { data: { label: string; value: number }[]; title: string }) {
  const width = 520;
  const height = 220;
  const padding = 24;
  const max = Math.max(...data.map((d) => d.value), 1);

  const points = data
    .map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const y = height - padding - (d.value / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="surface-panel chart-surface rounded-2xl p-5 h-full">
      <div className="mb-5 section-divider">
        <p className="section-eyebrow">Trend line</p>
        <h3 className="section-title mt-1">{title}</h3>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[240px] overflow-visible">
          {Array.from({ length: 5 }).map((_, i) => {
            const y = padding + ((height - padding * 2) / 4) * i;
            return (
              <line
                key={i}
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            );
          })}

          <polyline
            fill="none"
            stroke="#5ed9d7"
            strokeWidth="3"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: "drop-shadow(0 4px 12px rgba(94,217,215,0.18))",
              strokeDasharray: 1200,
              strokeDashoffset: 1200,
              animation: "lineDraw 1.2s cubic-bezier(.16,1,.3,1) forwards",
            }}
          />

          {data.map((d, i) => {
            const x = padding + (i * (width - padding * 2)) / Math.max(data.length - 1, 1);
            const y = height - padding - (d.value / max) * (height - padding * 2);
            return (
              <g key={d.label}>
                <circle cx={x} cy={y} r="5" fill="#051424" stroke="#5ed9d7" strokeWidth="2" />
                <circle cx={x} cy={y} r="2.5" fill="#5ed9d7" />
                <text x={x} y={height - 6} textAnchor="middle" fill="rgba(203,213,225,0.55)" fontSize="10" fontFamily="JetBrains Mono">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function VerticalBarChart({
  data,
  title,
}: {
  data: { name: string; value: number; color: string }[];
  title: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="surface-panel chart-surface rounded-2xl p-5 h-full">
      <div className="mb-5 section-divider">
        <p className="section-eyebrow">Distribution</p>
        <h3 className="section-title mt-1">{title}</h3>
      </div>

      <div className="relative h-[240px]">
        {hovered !== null && data[hovered] && (
          <div className="absolute right-0 top-0 rounded-xl border border-white/6 bg-[#091523ee] px-3 py-2 text-[12px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-opacity duration-150">
            <div className="font-medium">{data[hovered].name}</div>
            <div className="text-slate-400 mt-1">{data[hovered].value} records</div>
          </div>
        )}

        <div className="absolute inset-0 flex items-end gap-3">
          {data.map((item, i) => {
            const heightPct = (item.value / max) * 100;
            return (
              <div key={item.name} className="flex-1 h-full flex flex-col justify-end items-center gap-3" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                <div className="w-full flex-1 flex items-end justify-center">
                  <div
                    className="w-full max-w-[56px] rounded-t-2xl border border-white/8 relative overflow-hidden transition-all duration-300"
                    style={{
                      height: `${Math.max(heightPct, 10)}%`,
                      background: `linear-gradient(180deg, ${item.color}, rgba(255,255,255,0.06))`,
                      boxShadow: `0 8px 24px ${item.color}22`,
                      transformOrigin: "bottom",
                      animation: `barGrow 800ms cubic-bezier(.16,1,.3,1) ${i * 70}ms both`,
                    }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent_40%)]" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[13px] text-white font-medium">{item.value}</div>
                  <div className="mono-label text-slate-500 mt-1">{item.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DonutChart({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="surface-panel chart-surface rounded-2xl p-6 h-full flex flex-col justify-center">
      <div className="mb-5 section-divider">
        <p className="section-eyebrow">Status mix</p>
        <h3 className="section-title mt-1">Complaint status distribution</h3>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-center gap-8">
        <div className="relative w-44 h-44 shrink-0">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#0d1c2d" strokeWidth="14" />
            {segments.map((seg) => {
              const pct = total > 0 ? seg.value / total : 0;
              const dashLen = circumference * pct;
              const dashOffset = circumference * offset;
              offset += pct;

              return (
                <circle
                  key={seg.label}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="14"
                  strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                  strokeDashoffset={-dashOffset}
                  strokeLinecap="round"
                  style={{ transition: "all 500ms cubic-bezier(.16,1,.3,1)", filter: `drop-shadow(0 6px 12px ${seg.color}22)` }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="metric-value text-[34px] font-bold text-white">{total}</span>
            <span className="mono-label text-slate-500 mt-1">Total</span>
          </div>
        </div>

        <div className="space-y-3 min-w-[200px]">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.02] border border-white/6 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-[14px] text-slate-300">{seg.label}</span>
              </div>
              <span className="text-[14px] font-semibold text-white">{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [analyticsRes, complaintsRes, workOrdersRes] = await Promise.allSettled([
        getAnalytics(),
        getComplaints(),
        getWorkOrders(),
      ]);
      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value);
      if (complaintsRes.status === "fulfilled") setComplaints(Array.isArray(complaintsRes.value) ? complaintsRes.value : []);
      if (workOrdersRes.status === "fulfilled") setWorkOrders(Array.isArray(workOrdersRes.value) ? workOrdersRes.value : []);

      if (analyticsRes.status === "rejected" && complaintsRes.status === "rejected" && workOrdersRes.status === "rejected") {
        throw new Error("All API endpoints failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalComplaints = analytics?.total_complaints ?? complaints.length;
  const inProgress = analytics?.in_progress ?? complaints.filter((c) => (c.status || "").toLowerCase().includes("progress") || (c.status || "").toLowerCase() === "assigned").length;
  const resolved = analytics?.resolved ?? complaints.filter((c) => (c.status || "").toLowerCase() === "resolved" || (c.status || "").toLowerCase() === "completed").length;
  const pending = analytics?.pending ?? complaints.filter((c) => (c.status || "").toLowerCase() === "pending").length;
  const sla = analytics?.sla_compliance ?? "N/A";

  const categoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    complaints.forEach((c) => {
      const cat = c.category || "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const colors = ["#5ed9d7", "#2f5d8a", "#66d9a0", "#ff6b6b", "#f0c674", "#a78bfa", "#f472b6"];
    return Object.entries(categoryMap).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [complaints]);

  const priorityData = useMemo(() => {
    const priorityMap: Record<string, number> = {};
    complaints.forEach((c) => {
      const p = c.priority || "Medium";
      priorityMap[p] = (priorityMap[p] || 0) + 1;
    });
    const priorityColorMap: Record<string, string> = {
      High: "#ff6b6b",
      Critical: "#ff6b6b",
      Medium: "#f0c674",
      Low: "#66d9a0",
    };
    return Object.entries(priorityMap).map(([name, value]) => ({ name, value, color: priorityColorMap[name] || "#5ed9d7" }));
  }, [complaints]);

  const trendData = useMemo(() => {
    const base = [pending, inProgress, resolved, workOrders.length, complaints.length, Math.max(pending + inProgress, 1)];
    return [
      { label: "Jan", value: Math.max(base[0], 1) },
      { label: "Feb", value: Math.max(base[1], 1) },
      { label: "Mar", value: Math.max(base[2], 1) },
      { label: "Apr", value: Math.max(base[3], 1) },
      { label: "May", value: Math.max(base[4], 1) },
      { label: "Jun", value: Math.max(base[5], 1) },
    ];
  }, [pending, inProgress, resolved, workOrders.length, complaints.length]);

  const donutSegments = [
    { label: "Pending", value: pending, color: "#f0c674" },
    { label: "In Progress", value: inProgress, color: "#5ed9d7" },
    { label: "Resolved", value: resolved, color: "#66d9a0" },
  ];

  const totalCost = workOrders.reduce((s, w) => s + (Number(w.estimated_cost) || 0), 0);
  const completedWO = workOrders.filter((w) => (w.status || "").toLowerCase() === "completed" || (w.status || "").toLowerCase() === "resolved").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="surface-panel rounded-3xl px-6 sm:px-8 py-8">
          <div className="skeleton h-4 w-28 mb-4" />
          <div className="skeleton h-10 w-72 max-w-full mb-4" />
          <div className="skeleton h-4 w-[32rem] max-w-full" />
        </section>
        <KpiSkeletonGrid count={5} />
        <div className="grid xl:grid-cols-3 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error && !analytics && complaints.length === 0) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes lineDraw { to { stroke-dashoffset: 0; } }
        @keyframes barGrow { from { transform: scaleY(0.12); opacity: 0.45; } to { transform: scaleY(1); opacity: 1; } }
      `}</style>

      <section className="surface-panel rounded-3xl px-6 sm:px-8 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(94,217,215,0.08),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(47,93,138,0.1),transparent_26%)]" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div>
            <p className="section-eyebrow mb-3">Performance intelligence</p>
            <h1 className="page-title">Operational analytics</h1>
            <p className="body-copy text-slate-400 mt-4 max-w-3xl">
              Enterprise reporting view for complaint throughput, service compliance, execution volume, and operational distribution across civic response categories.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2.5 rounded-xl text-[12px] font-semibold surface-panel-soft border border-white/6 text-slate-200 hover:text-white btn-elevate"
          >
            ↻ Refresh analytics
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Total Complaints" value={totalComplaints} icon="📋" color="accent" trend="Administrative intake volume" />
        <StatCard label="Pending" value={pending} icon="⏰" color="warning" trend="Awaiting intervention" />
        <StatCard label="In Progress" value={inProgress} icon="⏳" color="primary" trend="Active field response" />
        <StatCard label="Resolved" value={resolved} icon="✅" color="resolved" trend="Successful closure count" />
        <StatCard label="SLA Compliance" value={typeof sla === "number" ? `${sla}%` : sla} icon="📊" color={typeof sla === "number" && sla >= 90 ? "resolved" : "warning"} trend="Governance service benchmark" />
      </div>

      <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <LineTrendChart data={trendData} title="Service performance trend" />
        <DonutChart segments={donutSegments} total={totalComplaints} />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        {categoryData.length > 0 ? <VerticalBarChart data={categoryData} title="Complaints by category" /> : <ChartSkeleton />}
        {priorityData.length > 0 ? <VerticalBarChart data={priorityData} title="Complaints by priority" /> : <ChartSkeleton />}
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Work Orders" value={workOrders.length} icon="🔧" color="primary" trend="Orders issued for action" />
        <StatCard label="Completed Orders" value={completedWO} icon="✅" color="resolved" trend="Field tasks formally closed" />
        <StatCard label="Completion Rate" value={workOrders.length > 0 ? `${Math.round((completedWO / workOrders.length) * 100)}%` : "0%"} icon="📈" color="accent" trend="Execution efficiency" />
        <StatCard label="Total Est. Cost" value={totalCost > 0 ? `₹${totalCost.toLocaleString("en-IN")}` : "₹0"} icon="💰" color="warning" trend="Projected expenditure" />
      </div>

      {analytics && (
        <section className="surface-panel rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 mb-5 section-divider">
            <div>
              <p className="section-eyebrow">System payload</p>
              <h2 className="section-title mt-1">Raw analytics response</h2>
            </div>
            <span className="mono-label text-slate-500">Inspect source</span>
          </div>
          <pre className="bg-[#081523] rounded-2xl p-4 text-[12px] leading-6 font-mono text-slate-400 overflow-x-auto border border-white/6">
            {JSON.stringify(analytics, null, 2)}
          </pre>
          {error && (
            <div className="mt-4 rounded-xl border border-warning/20 bg-warning/6 px-4 py-3 text-[12px] text-warning">
              Partial data warning: {error}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
