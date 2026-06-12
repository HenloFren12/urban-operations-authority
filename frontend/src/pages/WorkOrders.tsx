import { useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorState, TableSkeleton } from "../components/LoadingState";
import StatusBadge from "../components/StatusBadge";
import { completeWorkOrder, getWorkOrders } from "../utils/api";

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [completing, setCompleting] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getWorkOrders();
      setWorkOrders(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch work orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleComplete = async (woId: string) => {
    setCompleting(woId);
    setActionMsg("");
    try {
      await completeWorkOrder(woId);
      setActionMsg(`Work order ${woId} marked as completed`);
      await fetchData();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setCompleting(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      const status = (wo.status || "").toLowerCase();
      if (filter === "all") return true;
      if (filter === "assigned") return status === "assigned" || status.includes("progress");
      if (filter === "completed") return status === "completed" || status === "resolved";
      return true;
    });
  }, [workOrders, filter]);

  const activeCount = workOrders.filter((w) => {
    const s = (w.status || "").toLowerCase();
    return s === "assigned" || s.includes("progress");
  }).length;
  const completedCount = workOrders.filter((w) => {
    const s = (w.status || "").toLowerCase();
    return s === "completed" || s === "resolved";
  }).length;
  const totalCost = workOrders.reduce((sum, w) => sum + (Number(w.estimated_cost) || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="surface-panel rounded-3xl px-6 sm:px-8 py-8">
          <div className="skeleton h-4 w-36 mb-4" />
          <div className="skeleton h-10 w-80 max-w-full mb-4" />
          <div className="skeleton h-4 w-[34rem] max-w-full" />
        </section>
        <div className="grid md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="surface-panel rounded-2xl p-5">
              <div className="skeleton h-3 w-24 mb-4" />
              <div className="skeleton h-8 w-20" />
            </div>
          ))}
        </div>
        <TableSkeleton rows={7} columns={7} />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-3xl px-6 sm:px-8 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(94,217,215,0.08),transparent_22%)]" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div>
            <p className="section-eyebrow mb-3">Execution management</p>
            <h1 className="page-title">Work order operations</h1>
            <p className="body-copy text-slate-400 mt-4 max-w-3xl">
              Monitor assignment status, estimated expenditure, and crew delivery progress for civic infrastructure remediation tasks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="mono-label text-slate-500">{filteredOrders.length} / {workOrders.length} visible</span>
            <button
              onClick={fetchData}
              className="px-4 py-2.5 rounded-xl text-[12px] font-semibold surface-panel-soft border border-white/6 text-slate-200 hover:text-white btn-elevate"
            >
              ↻ Refresh work orders
            </button>
          </div>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="surface-panel rounded-2xl p-5">
          <p className="mono-label text-slate-500">Total orders</p>
          <p className="metric-value text-[30px] font-bold text-white mt-2">{workOrders.length}</p>
          <p className="text-[13px] text-slate-500 mt-2">Orders currently tracked</p>
        </div>
        <div className="surface-panel rounded-2xl p-5">
          <p className="mono-label text-slate-500">Active</p>
          <p className="metric-value text-[30px] font-bold text-accent mt-2">{activeCount}</p>
          <p className="text-[13px] text-slate-500 mt-2">Assigned or in progress</p>
        </div>
        <div className="surface-panel rounded-2xl p-5">
          <p className="mono-label text-slate-500">Completed</p>
          <p className="metric-value text-[30px] font-bold text-resolved mt-2">{completedCount}</p>
          <p className="text-[13px] text-slate-500 mt-2">Closed field tasks</p>
        </div>
        <div className="surface-panel rounded-2xl p-5">
          <p className="mono-label text-slate-500">Estimated cost</p>
          <p className="metric-value text-[30px] font-bold text-warning mt-2">₹{totalCost.toLocaleString("en-IN")}</p>
          <p className="text-[13px] text-slate-500 mt-2">Aggregate planned spend</p>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`px-4 py-3 rounded-xl text-[12px] font-medium badge-animate ${
            actionMsg.startsWith("Error")
              ? "bg-critical/10 border border-critical/20 text-critical"
              : "bg-resolved/10 border border-resolved/20 text-resolved"
          }`}
        >
          {actionMsg}
        </div>
      )}

      <section className="surface-panel rounded-2xl p-5">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-5 section-divider">
          <div>
            <p className="section-eyebrow">Controls</p>
            <h2 className="section-title mt-1">Filter work orders</h2>
          </div>

          <div className="flex items-center gap-1 surface-panel-soft rounded-xl p-1 border border-white/6 w-fit">
            {[
              { key: "all", label: "All Orders" },
              { key: "assigned", label: "In Progress" },
              { key: "completed", label: "Completed" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 ${
                  filter === f.key
                    ? "bg-primary/25 text-white border border-primary/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No Work Orders"
            message="Generate work orders from the complaints registry when intervention is required."
            icon="🔧"
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/6">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="bg-black/10 border-b border-white/6">
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Work Order ID</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Complaint Ref</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Assigned Crew</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Estimated Cost</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Date</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Status</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {filteredOrders.map((wo: any, i: number) => {
                  const woId = wo.work_order_id || wo.id || i + 1;
                  const status = (wo.status || "assigned").toLowerCase();
                  const canComplete = status !== "completed" && status !== "resolved";

                  return (
                    <tr key={woId} className="table-row-hover align-top">
                      <td className="px-5 py-4 text-[12px] font-mono text-accent font-semibold">WO-{String(woId).padStart(4, "0")}</td>
                      <td className="px-5 py-4 text-[12px] font-mono text-slate-500">
                        {wo.complaint_id ? `#${String(wo.complaint_id).padStart(4, "0")}` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/12 border border-primary/12 flex items-center justify-center text-[14px]">👷</div>
                          <div>
                            <p className="text-[14px] text-white font-medium">{wo.assigned_crew || wo.crew || "Unassigned"}</p>
                            <p className="text-[12px] text-slate-500 mt-1">Field operations unit</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[14px] font-mono text-white">
                        {wo.estimated_cost != null ? `₹${Number(wo.estimated_cost).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-slate-500 font-mono whitespace-nowrap">{wo.created_at || wo.date || "—"}</td>
                      <td className="px-5 py-4"><StatusBadge status={wo.status || "assigned"} /></td>
                      <td className="px-5 py-4">
                        {canComplete ? (
                          <button
                            onClick={() => handleComplete(String(woId))}
                            disabled={completing === String(woId)}
                            className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-resolved/12 text-resolved border border-resolved/18 hover:bg-resolved/20 transition-all duration-200 disabled:opacity-50 whitespace-nowrap btn-elevate"
                          >
                            {completing === String(woId) ? (
                              <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border border-resolved/30 border-t-resolved rounded-full animate-spin" />
                                Completing...
                              </span>
                            ) : (
                              "Mark Complete"
                            )}
                          </button>
                        ) : (
                          <span className="mono-label text-slate-600">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
