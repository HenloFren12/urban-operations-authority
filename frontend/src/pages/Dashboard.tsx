import { useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorState, KpiSkeletonGrid, TableSkeleton } from "../components/LoadingState";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { getAnalytics, getComplaints, getWorkOrders } from "../utils/api";

interface AnalyticsData {
  total_complaints?: number;
  in_progress?: number;
  resolved?: number;
  sla_compliance?: number | string;
  pending?: number;
  [key: string]: any;
}

function DashboardWatermark() {
  return (
    <svg viewBox="0 0 240 240" className="watermark-outline" fill="none">
      <circle cx="120" cy="120" r="86" stroke="rgba(94,217,215,0.35)" strokeWidth="1.5" />
      <circle cx="120" cy="120" r="64" stroke="rgba(94,217,215,0.2)" strokeWidth="1" strokeDasharray="4 6" />
      <path d="M120 54 L152 92 L120 132 L88 92 Z" stroke="rgba(94,217,215,0.25)" strokeWidth="1.5" />
      <path d="M120 92 L120 182" stroke="rgba(94,217,215,0.18)" strokeWidth="1" />
      <path d="M88 92 L152 92" stroke="rgba(94,217,215,0.18)" strokeWidth="1" />
    </svg>
  );
}

function OperationsMap({ complaints }: { complaints: any[] }) {
  const activeItems = complaints.filter((c) => {
    const s = (c.status || "").toLowerCase();
    return s !== "resolved" && s !== "completed" && s !== "closed";
  });

  const markers = activeItems.slice(0, 8).map((item, index) => ({
    id: item.complaint_id || item.id || index,
    top: [18, 26, 37, 48, 56, 62, 41, 24][index % 8],
    left: [22, 56, 43, 68, 31, 74, 16, 51][index % 8],
    breached: ["critical", "high"].includes((item.priority || "").toLowerCase()),
    label: item.category || "Complaint",
  }));

  return (
    <div className="surface-panel chart-surface rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="section-eyebrow">Field activity</p>
          <h3 className="section-title mt-1">Operational zone map</h3>
        </div>
        <div className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.08em]">
          {markers.length} active markers
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-white/6 bg-[linear-gradient(180deg,rgba(7,20,34,0.95),rgba(11,26,42,0.95))] min-h-[290px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(47,93,138,0.18),transparent_24%),radial-gradient(circle_at_70%_30%,rgba(94,217,215,0.08),transparent_20%),radial-gradient(circle_at_60%_80%,rgba(47,93,138,0.12),transparent_24%)]" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-35">
          <path d="M10 18 L30 10 L49 16 L67 11 L88 19 L84 38 L92 55 L80 77 L61 84 L40 90 L18 77 L9 56 L14 34 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(94,217,215,0.18)" strokeWidth="0.6" />
          <path d="M20 24 L40 20 L54 26 L42 40 L25 36 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <path d="M46 26 L66 22 L79 31 L67 46 L50 43 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <path d="M28 42 L46 46 L43 63 L24 61 L17 48 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <path d="M49 48 L68 50 L77 67 L59 76 L45 65 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        </svg>

        {markers.length > 0 ? (
          markers.map((marker) => (
            <div
              key={marker.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${marker.top}%`, left: `${marker.left}%` }}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border border-white/30 ${marker.breached ? "bg-critical shadow-[0_0_16px_rgba(255,107,107,0.35)]" : "bg-accent marker-pulse"}`}
                title={marker.label}
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                🛰️
              </div>
              <p className="text-base font-semibold text-white">No Active Complaints</p>
              <p className="text-sm text-slate-500 mt-1">System currently stable</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
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

      if (analyticsRes.status === "rejected" && complaintsRes.status === "rejected") {
        throw new Error("Failed to fetch data from the server.");
      }
    } catch (err: any) {
      setError(err.message || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalComplaints = analytics?.total_complaints ?? complaints.length ?? 0;
  const inProgress = analytics?.in_progress ?? complaints.filter((c: any) => c.status?.toLowerCase().includes("progress") || c.status?.toLowerCase() === "assigned").length ?? 0;
  const resolved = analytics?.resolved ?? complaints.filter((c: any) => c.status?.toLowerCase() === "resolved" || c.status?.toLowerCase() === "completed").length ?? 0;
  const pending = analytics?.pending ?? complaints.filter((c: any) => c.status?.toLowerCase() === "pending").length ?? 0;
  const slaCompliance = analytics?.sla_compliance ?? "N/A";

  const recentComplaints = useMemo(() => complaints.slice(0, 5), [complaints]);
  const recentWorkOrders = useMemo(() => workOrders.slice(0, 5), [workOrders]);

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="surface-panel rounded-3xl px-6 sm:px-8 py-8 sm:py-10">
          <div className="skeleton h-4 w-40 mb-4" />
          <div className="skeleton h-12 w-72 max-w-full mb-4" />
          <div className="skeleton h-4 w-[32rem] max-w-full mb-8" />
          <div className="skeleton h-10 w-44" />
        </section>
        <KpiSkeletonGrid count={4} />
        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <TableSkeleton rows={5} columns={4} />
          <TableSkeleton rows={5} columns={3} />
        </div>
      </div>
    );
  }

  if (error && !analytics && complaints.length === 0) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-3xl px-6 sm:px-8 py-8 sm:py-10 relative overflow-hidden">
        <DashboardWatermark />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,93,138,0.12),transparent_28%),linear-gradient(90deg,rgba(255,255,255,0.01),transparent)]" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="section-eyebrow mb-3">Executive overview</p>
            <h1 className="page-title max-w-2xl">Urban civic operations command dashboard</h1>
            <p className="body-copy text-slate-400 mt-4 max-w-2xl">
              Consolidated visibility into complaints, work orders, field activity, and service-level performance across the Urban Operations Authority administrative network.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2.5 rounded-xl text-[12px] font-semibold surface-panel-soft border border-white/6 text-slate-200 hover:text-white btn-elevate"
          >
            ↻ Refresh dashboard
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Complaints" value={totalComplaints} icon="📋" color="accent" trend={`${complaints.length} records synchronized`} />
        <StatCard label="In Progress" value={inProgress} icon="⏳" color="primary" trend="Active municipal workflows" />
        <StatCard label="Resolved" value={resolved} icon="✅" color="resolved" trend="Closure performance improved" />
        <StatCard label="SLA Compliance" value={typeof slaCompliance === "number" ? `${slaCompliance}%` : slaCompliance} icon="📊" color="warning" trend="Service delivery benchmark" />
      </div>

      <div className="grid xl:grid-cols-[1.25fr_0.75fr] gap-6">
        <section className="surface-panel rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 mb-5 section-divider">
            <div>
              <p className="section-eyebrow">Operational summary</p>
              <h2 className="section-title mt-1">Complaint lifecycle snapshot</h2>
            </div>
            <div className="text-right">
              <p className="mono-label">Live sync</p>
              <p className="text-[13px] text-slate-300 mt-1">{new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
            </div>
          </div>

          {pending === 0 ? (
            <EmptyState title="No Active Complaints" message="System currently stable" icon="🛡️" />
          ) : (
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="surface-panel-soft rounded-2xl p-4">
                <p className="mono-label">Pending</p>
                <p className="metric-value text-[28px] font-bold text-white mt-2">{pending}</p>
                <p className="text-[13px] text-slate-500 mt-2">Awaiting action or work order generation</p>
              </div>
              <div className="surface-panel-soft rounded-2xl p-4">
                <p className="mono-label">Resolution rate</p>
                <p className="metric-value text-[28px] font-bold text-white mt-2">
                  {totalComplaints > 0 ? `${Math.round((resolved / totalComplaints) * 100)}%` : "0%"}
                </p>
                <p className="text-[13px] text-slate-500 mt-2">Closed against total reported complaints</p>
              </div>
              <div className="surface-panel-soft rounded-2xl p-4">
                <p className="mono-label">Work orders</p>
                <p className="metric-value text-[28px] font-bold text-white mt-2">{workOrders.length}</p>
                <p className="text-[13px] text-slate-500 mt-2">Administrative orders in circulation</p>
              </div>
            </div>
          )}
        </section>

        <OperationsMap complaints={complaints} />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <section className="surface-panel rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6 flex items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow">Recent intake</p>
              <h2 className="section-title mt-1">Latest complaints</h2>
            </div>
            <span className="mono-label text-slate-500">{complaints.length} total</span>
          </div>

          <div className="divide-y divide-white/6">
            {recentComplaints.length > 0 ? (
              recentComplaints.map((c: any, i: number) => (
                <div key={c.complaint_id || c.id || i} className="table-row-hover px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[14px] text-white font-medium truncate">
                      {c.description || c.complaint_text || c.title || `Complaint #${c.complaint_id || c.id || i + 1}`}
                    </p>
                    <p className="text-[13px] text-slate-500 mt-1 truncate">
                      {(c.category || "General")} • {(c.date || c.created_at || c.timestamp || "—")}
                    </p>
                  </div>
                  <StatusBadge status={c.status || c.priority || "pending"} />
                </div>
              ))
            ) : (
              <div className="p-5">
                <EmptyState title="No Active Complaints" message="System currently stable" icon="📭" />
              </div>
            )}
          </div>
        </section>

        <section className="surface-panel rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6 flex items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow">Field execution</p>
              <h2 className="section-title mt-1">Latest work orders</h2>
            </div>
            <span className="mono-label text-slate-500">{workOrders.length} total</span>
          </div>

          <div className="divide-y divide-white/6">
            {recentWorkOrders.length > 0 ? (
              recentWorkOrders.map((wo: any, i: number) => (
                <div key={wo.work_order_id || wo.id || i} className="table-row-hover px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[14px] text-white font-medium truncate">
                      WO-{wo.work_order_id || wo.id || i + 1}
                      {wo.assigned_crew ? ` • ${wo.assigned_crew}` : ""}
                    </p>
                    <p className="text-[13px] text-slate-500 mt-1 truncate">
                      {wo.estimated_cost ? `₹${Number(wo.estimated_cost).toLocaleString("en-IN")}` : "Cost TBD"} • {wo.created_at || wo.date || "—"}
                    </p>
                  </div>
                  <StatusBadge status={wo.status || "assigned"} />
                </div>
              ))
            ) : (
              <div className="p-5">
                <EmptyState title="No Work Orders" message="Generate orders from complaint intake when required." icon="🔧" />
              </div>
            )}
          </div>
        </section>
      </div>

      {analytics && (
        <section className="surface-panel rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 mb-5 section-divider">
            <div>
              <p className="section-eyebrow">Diagnostics</p>
              <h2 className="section-title mt-1">Analytics response detail</h2>
            </div>
            <span className="mono-label text-slate-500">Raw payload</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
            {Object.entries(analytics).map(([key, value]) => (
              <div key={key} className="surface-panel-soft rounded-xl px-4 py-3">
                <p className="metric-value text-[20px] font-bold text-white">
                  {typeof value === "number" ? value.toLocaleString() : String(value)}
                </p>
                <p className="mono-label text-slate-500 mt-2">{key.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-xl border border-warning/20 bg-warning/6 px-4 py-3 text-[12px] text-warning">
              Partial data warning: {error}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
