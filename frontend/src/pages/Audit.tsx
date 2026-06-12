import { useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorState, LoadingSkeleton } from "../components/LoadingState";
import StatusBadge from "../components/StatusBadge";
import { getComplaints, getWorkOrders } from "../utils/api";

interface AuditEntry {
  id: string;
  timestamp: string;
  type: "complaint" | "work_order";
  action: string;
  description: string;
  status: string;
  meta: Record<string, any>;
}

function parseTimestamp(raw: string | undefined): string {
  if (!raw) return new Date().toISOString();
  try {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? raw : d.toISOString();
  } catch {
    return raw;
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function AuditSkeleton() {
  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-3xl px-6 sm:px-8 py-8">
        <div className="skeleton h-4 w-28 mb-4" />
        <div className="skeleton h-10 w-72 max-w-full mb-4" />
        <div className="skeleton h-4 w-[32rem] max-w-full" />
      </section>
      <div className="surface-panel rounded-2xl p-5">
        <LoadingSkeleton rows={6} />
      </div>
    </div>
  );
}

export default function Audit() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [complaintsRes, workOrdersRes] = await Promise.allSettled([
        getComplaints(),
        getWorkOrders(),
      ]);

      const auditEntries: AuditEntry[] = [];

      if (complaintsRes.status === "fulfilled" && Array.isArray(complaintsRes.value)) {
        complaintsRes.value.forEach((c: any) => {
          auditEntries.push({
            id: `C-${c.complaint_id || c.id}`,
            timestamp: parseTimestamp(c.created_at || c.date || c.timestamp),
            type: "complaint",
            action: "Complaint Filed",
            description: c.description || c.complaint_text || c.title || "Infrastructure complaint registered",
            status: c.status || "pending",
            meta: {
              category: c.category,
              priority: c.priority,
              complaint_id: c.complaint_id || c.id,
            },
          });
        });
      }

      if (workOrdersRes.status === "fulfilled" && Array.isArray(workOrdersRes.value)) {
        workOrdersRes.value.forEach((wo: any) => {
          auditEntries.push({
            id: `WO-${wo.work_order_id || wo.id}`,
            timestamp: parseTimestamp(wo.created_at || wo.date),
            type: "work_order",
            action:
              (wo.status || "").toLowerCase() === "completed"
                ? "Work Order Completed"
                : "Work Order Created",
            description: `Work order assigned to ${wo.assigned_crew || wo.crew || "crew"}. Est. cost: ₹${Number(wo.estimated_cost || 0).toLocaleString("en-IN")}`,
            status: wo.status || "assigned",
            meta: {
              assigned_crew: wo.assigned_crew || wo.crew,
              estimated_cost: wo.estimated_cost,
              complaint_id: wo.complaint_id,
              work_order_id: wo.work_order_id || wo.id,
            },
          });
        });
      }

      if (complaintsRes.status === "rejected" && workOrdersRes.status === "rejected") {
        throw new Error("Failed to fetch data from both endpoints.");
      }

      auditEntries.sort((a, b) => {
        try {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        } catch {
          return 0;
        }
      });

      setEntries(auditEntries);
    } catch (err: any) {
      setError(err.message || "Failed to build audit trail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => entries.filter((e) => typeFilter === "all" || e.type === typeFilter), [entries, typeFilter]);

  if (loading) return <AuditSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-3xl px-6 sm:px-8 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,93,138,0.1),transparent_25%)]" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div>
            <p className="section-eyebrow mb-3">Compliance ledger</p>
            <h1 className="page-title">Audit trail</h1>
            <p className="body-copy text-slate-400 mt-4 max-w-3xl">
              Chronological operational log of complaint intake, work-order issuance, and completion events for administrative oversight and governance assurance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="mono-label text-slate-500">{filtered.length} entries</span>
            <button
              onClick={fetchData}
              className="px-4 py-2.5 rounded-xl text-[12px] font-semibold surface-panel-soft border border-white/6 text-slate-200 hover:text-white btn-elevate"
            >
              ↻ Refresh audit log
            </button>
          </div>
        </div>
      </section>

      <section className="surface-panel rounded-2xl p-5">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-5 section-divider">
          <div>
            <p className="section-eyebrow">Controls</p>
            <h2 className="section-title mt-1">Filter timeline events</h2>
          </div>
          <div className="flex items-center gap-1 surface-panel-soft rounded-xl p-1 border border-white/6 w-fit">
            {[
              { key: "all", label: "All Events" },
              { key: "complaint", label: "Complaints" },
              { key: "work_order", label: "Work Orders" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 ${
                  typeFilter === f.key
                    ? "bg-primary/25 text-white border border-primary/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No audit entries" message="No records found for the selected filter." icon="🧾" />
        ) : (
          <div className="relative">
            <div className="absolute left-[18px] sm:left-[24px] top-0 bottom-0 w-px bg-gradient-to-b from-accent/30 via-primary/25 to-transparent" />
            <div className="space-y-3">
              {filtered.map((entry, i) => (
                <div key={entry.id + i} className="relative pl-12 sm:pl-16 group soft-rise" style={{ animationDelay: `${i * 20}ms` }}>
                  <div
                    className={`absolute left-[11px] sm:left-[17px] top-7 w-[15px] h-[15px] rounded-full border-2 z-10 ${
                      entry.type === "complaint"
                        ? "bg-accent/25 border-accent"
                        : "bg-primary/25 border-primary"
                    } ${entry.type === "complaint" ? "marker-pulse" : ""}`}
                  />

                  <div className="surface-panel surface-hover rounded-2xl p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/6 flex items-center justify-center text-[16px]">
                            {entry.type === "complaint" ? "📋" : "🔧"}
                          </span>
                          <div>
                            <p className="text-[15px] font-semibold tracking-[-0.02em] text-white">{entry.action}</p>
                            <p className="mono-label text-slate-500 mt-1">{entry.id}</p>
                          </div>
                        </div>
                        <p className="text-[14px] leading-6 text-slate-400 max-w-3xl">{entry.description}</p>
                      </div>
                      <StatusBadge status={entry.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/6 text-[12px] text-slate-500">
                      <span className="font-mono">🕐 {formatDate(entry.timestamp)}</span>
                      {entry.meta.category && <span>📂 {entry.meta.category}</span>}
                      {entry.meta.priority && <span>⚡ {entry.meta.priority}</span>}
                      {entry.meta.assigned_crew && <span>👷 {entry.meta.assigned_crew}</span>}
                      {entry.meta.estimated_cost != null && (
                        <span>💰 ₹{Number(entry.meta.estimated_cost).toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="surface-panel rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/16 flex items-center justify-center text-xl shrink-0">🛡️</div>
          <div>
            <p className="section-title">Audit compliance notice</p>
            <p className="body-copy text-slate-500 mt-3 max-w-4xl">
              All operational events displayed in this ledger are retained as part of the Urban Operations Authority administrative record. The timeline supports supervisory review, dispute resolution, performance assessment, and traceable public-service accountability within the Digital Governance Initiative.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
