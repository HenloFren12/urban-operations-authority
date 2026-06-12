import { useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorState, TableSkeleton } from "../components/LoadingState";
import StatusBadge from "../components/StatusBadge";
import { generateWorkOrder, getComplaints } from "../utils/api";

export default function Complaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getComplaints();
      setComplaints(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateWO = async (complaintId: string) => {
    setGenerating(complaintId);
    setActionMsg("");
    try {
      await generateWorkOrder(complaintId);
      setActionMsg(`Work order generated for complaint ${complaintId}`);
      await fetchData();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const status = (c.status || "").toLowerCase();
      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && status === "pending") ||
        (filter === "in_progress" && (status.includes("progress") || status === "assigned")) ||
        (filter === "resolved" && (status === "resolved" || status === "completed"));

      const sourceText = `${c.description || c.complaint_text || c.title || ""} ${c.category || ""}`.toLowerCase();
      const matchesSearch = !search || sourceText.includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [complaints, filter, search]);

  const pendingCount = complaints.filter((c) => (c.status || "").toLowerCase() === "pending").length;
  const activeCount = complaints.filter((c) => {
    const s = (c.status || "").toLowerCase();
    return s.includes("progress") || s === "assigned";
  }).length;
  const resolvedCount = complaints.filter((c) => {
    const s = (c.status || "").toLowerCase();
    return s === "resolved" || s === "completed";
  }).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="surface-panel rounded-3xl px-6 sm:px-8 py-8">
          <div className="skeleton h-4 w-32 mb-4" />
          <div className="skeleton h-10 w-80 max-w-full mb-4" />
          <div className="skeleton h-4 w-[34rem] max-w-full" />
        </section>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="surface-panel rounded-2xl p-5"><div className="skeleton h-3 w-20 mb-4" /><div className="skeleton h-8 w-16" /></div>
          <div className="surface-panel rounded-2xl p-5"><div className="skeleton h-3 w-20 mb-4" /><div className="skeleton h-8 w-16" /></div>
          <div className="surface-panel rounded-2xl p-5"><div className="skeleton h-3 w-20 mb-4" /><div className="skeleton h-8 w-16" /></div>
        </div>
        <TableSkeleton rows={7} columns={7} />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-3xl px-6 sm:px-8 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,93,138,0.12),transparent_24%)]" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div>
            <p className="section-eyebrow mb-3">Administrative intake</p>
            <h1 className="page-title">Complaints registry</h1>
            <p className="body-copy text-slate-400 mt-4 max-w-3xl">
              Review, classify, and escalate citizen-reported infrastructure issues with a complete operational record for downstream work-order generation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="mono-label text-slate-500">{filteredComplaints.length} / {complaints.length} visible</span>
            <button
              onClick={fetchData}
              className="px-4 py-2.5 rounded-xl text-[12px] font-semibold surface-panel-soft border border-white/6 text-slate-200 hover:text-white btn-elevate"
            >
              ↻ Refresh complaints
            </button>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="surface-panel rounded-2xl p-5">
          <p className="mono-label text-slate-500">Pending</p>
          <p className="metric-value text-[30px] font-bold text-white mt-2">{pendingCount}</p>
          <p className="text-[13px] text-slate-500 mt-2">Awaiting administrative action</p>
        </div>
        <div className="surface-panel rounded-2xl p-5">
          <p className="mono-label text-slate-500">In progress</p>
          <p className="metric-value text-[30px] font-bold text-white mt-2">{activeCount}</p>
          <p className="text-[13px] text-slate-500 mt-2">Under field or supervisory review</p>
        </div>
        <div className="surface-panel rounded-2xl p-5">
          <p className="mono-label text-slate-500">Resolved</p>
          <p className="metric-value text-[30px] font-bold text-white mt-2">{resolvedCount}</p>
          <p className="text-[13px] text-slate-500 mt-2">Closed and verified complaints</p>
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
            <h2 className="section-title mt-1">Filter and search complaints</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-1 surface-panel-soft rounded-xl p-1 border border-white/6 w-fit">
              {[
                { key: "all", label: "All" },
                { key: "pending", label: "Pending" },
                { key: "in_progress", label: "In Progress" },
                { key: "resolved", label: "Resolved" },
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
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category or description"
              className="w-full xl:w-80 px-4 py-2.5 rounded-xl bg-[#081523] border border-white/6 text-[14px] text-white placeholder-slate-600 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10"
            />
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <EmptyState
            title={complaints.length === 0 ? "No Active Complaints" : "No matching complaints"}
            message={complaints.length === 0 ? "System currently stable" : "Adjust the search term or status filter to view available records."}
            icon={complaints.length === 0 ? "🛡️" : "🔎"}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/6">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="bg-black/10 border-b border-white/6">
                  <th className="text-left px-5 py-3 mono-label text-slate-500">ID</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Category</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500 min-w-[260px]">Description</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Date</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Priority</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Status</th>
                  <th className="text-left px-5 py-3 mono-label text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {filteredComplaints.map((c: any, i: number) => {
                  const id = c.complaint_id || c.id || i + 1;
                  const status = (c.status || "pending").toLowerCase();
                  const canGenerate = status === "pending" || status === "open";

                  return (
                    <tr key={id} className="table-row-hover align-top">
                      <td className="px-5 py-4 text-[12px] font-mono text-accent">#{String(id).padStart(4, "0")}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-white/[0.03] border border-white/6 px-2.5 py-1 text-[12px] text-slate-300">
                          {c.category || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[14px] text-slate-300 leading-6 max-w-[340px]">
                        {c.description || c.complaint_text || c.title || "—"}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-slate-500 font-mono whitespace-nowrap">
                        {c.date || c.created_at || c.timestamp || "—"}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={c.priority || "medium"} /></td>
                      <td className="px-5 py-4"><StatusBadge status={c.status || "pending"} /></td>
                      <td className="px-5 py-4">
                        {canGenerate ? (
                          <button
                            onClick={() => handleGenerateWO(String(id))}
                            disabled={generating === String(id)}
                            className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-primary/18 text-accent border border-primary/18 hover:bg-primary/26 transition-all duration-200 disabled:opacity-50 whitespace-nowrap btn-elevate"
                          >
                            {generating === String(id) ? (
                              <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border border-accent/30 border-t-accent rounded-full animate-spin" />
                                Creating...
                              </span>
                            ) : (
                              "Generate Work Order"
                            )}
                          </button>
                        ) : (
                          <span className="mono-label text-slate-600">No action</span>
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
