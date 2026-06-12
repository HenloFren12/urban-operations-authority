import { Link } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const stats = [
  {
    label: "ACTIVE OPERATIONS",
    value: "1,248",
    sub: "+12% from last shift",
    subColor: "text-resolved",
    icon: "⚡",
  },
  {
    label: "UPTIME",
    value: "99.98%",
    sub: "Global Mesh Network",
    subColor: "text-slate-500",
    icon: "((•))",
  },
  {
    label: "INCIDENTS",
    value: "04",
    sub: "Critical response required",
    subColor: "text-slate-500",
    icon: "⚠",
    danger: true,
  },
];

const systems = [
  {
    icon: "🚦",
    title: "Traffic & Mobility",
    desc: "AI adaptive signaling and congestion prediction for autonomous and manual transit flows.",
    tag: "LIVE FEED",
    tagColor: "text-resolved border-resolved/30 bg-resolved/10",
    img: "traffic",
  },
  {
    icon: "⚡",
    title: "Energy Grid",
    desc: "Decentralized power distribution with real-time load balancing and renewable integration.",
    tag: "STABLE",
    tagColor: "text-accent border-accent/30 bg-accent/10",
    img: "energy",
  },
  {
    icon: "💧",
    title: "Water & Waste",
    desc: "Telemetry monitoring for consumption patterns, leak detection, and automated filtration.",
    tag: "OPTIMAL",
    tagColor: "text-primary border-primary/40 bg-primary/15",
    img: "water",
  },
];

const incidentLogs = [
  { title: "Sector 7B Surge", time: "14:22:05 · Active", status: "critical" },
  { title: "Traffic Reroute - 21st St", time: "13:47:02 · Resolved", status: "resolved" },
  { title: "Streetlight Mesh Fail", time: "12:11:48 · Resolved", status: "resolved" },
];

const footerLinks = {
  resources: ["Documentation", "API References", "Incident Protocols", "Audit Trails"],
  support: ["NOC Contact", "Ethics Board", "System Status", "Legal Notices"],
};

function SystemThumb({ kind }: { kind: string }) {
  if (kind === "traffic") {
    return (
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#0a2a3a,#0d1c2d)]">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 p-2 opacity-80">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-sm bg-[#0c4a5e]/60 border border-accent/20"
              style={{
                background:
                  i % 2 === 0
                    ? "linear-gradient(135deg,#0e7490,#155e75)"
                    : "linear-gradient(135deg,#0c4a6e,#082f49)",
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  if (kind === "energy") {
    return (
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0a1a2a,#06121f)]">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-accent/40 blur-md" />
        <div className="absolute inset-0 flex items-end justify-around px-4 pb-3 opacity-70">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-[2px] bg-accent/50" style={{ height: `${30 + ((i * 13) % 50)}%` }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#0a2a24,#06121f)]">
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-60">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-resolved/40"
            style={{ height: `${20 + ((i * 17) % 60)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const authenticated = isAuthenticated();

  return (
    <div className="bg-[#04111d]">
      {/* HERO */}
      <section className="relative min-h-[640px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/city-hero.jpg"
            alt="City skyline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,17,29,0.55)_0%,rgba(4,17,29,0.4)_45%,rgba(4,17,29,0.95)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_30%,rgba(4,17,29,0.45)_100%)]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto pt-16">
          <h1 className="text-[40px] sm:text-[52px] font-bold tracking-[-0.025em] leading-[1.08] text-white">
            City Infrastructure
            <br />
            Operations Platform
          </h1>
          <p className="text-[14px] sm:text-[15px] text-slate-300/90 leading-relaxed mt-6 max-w-xl mx-auto">
            AI-Orchestrated Urban Maintenance &amp; Incident Response. Monitor,
            manage, and optimize municipal services through a high-precision
            digital twin environment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9">
            <Link
              to={authenticated ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-[14px] font-semibold bg-primary text-white btn-elevate shadow-[0_8px_30px_rgba(47,93,138,0.4)]"
            >
              Enter Administration Portal
            </Link>
            <Link
              to="/analytics"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-[14px] font-semibold bg-white/[0.04] border border-accent/40 text-accent hover:bg-accent/10 transition-all duration-200"
            >
              View Public Dashboard
            </Link>
          </div>

          <div className="mt-16 text-slate-500 text-xl animate-bounce">⌄</div>
        </div>
      </section>

      {/* STAT BAR */}
      <section className="max-w-[1180px] mx-auto px-5 sm:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="surface-panel rounded-xl px-6 py-5 flex items-start justify-between"
            >
              <div>
                <p className="mono-label text-slate-500">{s.label}</p>
                <p
                  className={`metric-value text-[30px] font-bold mt-3 ${s.danger ? "text-critical" : "text-white"}`}
                >
                  {s.value}
                </p>
                <p className={`text-[11px] font-mono mt-2 ${s.subColor}`}>
                  {s.sub}
                </p>
              </div>
              <span
                className={`text-[15px] ${s.danger ? "text-critical" : "text-accent"} font-mono opacity-80`}
              >
                {s.icon}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* INTEGRATED URBAN SYSTEMS */}
      <section className="max-w-[1180px] mx-auto px-5 sm:px-8 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
          <div>
            <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-white">
              Integrated Urban Systems
            </h2>
            <p className="text-[13px] text-slate-500 mt-2 max-w-lg leading-relaxed">
              Real-time control over city-wide infrastructure sectors powered by
              advanced neural processing and IoT telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-resolved pulse-dot" />
            <span className="mono-label text-resolved">All Systems Operational</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {systems.map((sys) => (
            <div
              key={sys.title}
              className="surface-panel surface-hover rounded-xl overflow-hidden"
            >
              <div className="relative h-36 overflow-hidden border-b border-white/6">
                <SystemThumb kind={sys.img} />
              </div>
              <div className="p-5">
                <h3 className="text-[16px] font-semibold text-accent flex items-center gap-2">
                  <span className="text-[14px]">{sys.icon}</span>
                  {sys.title}
                </h3>
                <p className="text-[13px] text-slate-400 leading-relaxed mt-3 min-h-[60px]">
                  {sys.desc}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span
                    className={`mono-label px-2 py-1 rounded border ${sys.tagColor}`}
                  >
                    {sys.tag}
                  </span>
                  <span className="text-slate-500 text-lg">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ANALYTICS ENGINE */}
      <section className="max-w-[1180px] mx-auto px-5 sm:px-8 pt-16 pb-16">
        <div className="surface-panel rounded-2xl p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-white">
                Analytics Engine v4.2
              </h2>
              <p className="mono-label text-slate-500 mt-2">
                Predictive Maintenance Interface
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="mono-label px-3 py-2 rounded border border-white/8 text-slate-400 hover:text-white transition-colors duration-200">
                Export Data
              </button>
              <Link
                to="/analytics"
                className="mono-label px-3 py-2 rounded bg-primary/30 border border-primary/30 text-accent hover:bg-primary/40 transition-colors duration-200"
              >
                Run Simulation
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.7fr_1fr] gap-5">
            {/* Visualization placeholder */}
            <div className="relative rounded-xl bg-[#081523] border border-white/6 min-h-[220px] flex items-center justify-center overflow-hidden">
              <div className="absolute top-3 right-3 surface-panel-soft rounded px-3 py-2">
                <p className="mono-label text-slate-500">Network Latency</p>
                <p className="text-[15px] font-mono text-accent mt-1">
                  12ms <span className="text-slate-600 text-[10px]">OPTIMAL</span>
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl text-slate-700 mb-3">📈</div>
                <p className="text-[13px] text-slate-500">
                  Real-time Data Visualization Placeholder
                </p>
                <p className="text-[11px] text-slate-700 mt-1">
                  Awaiting synchronization from control server
                </p>
              </div>
            </div>

            {/* Incident logs + efficiency */}
            <div className="space-y-4">
              <div className="rounded-xl bg-[#081523] border border-white/6 p-4">
                <p className="mono-label text-slate-500 mb-3">Incident Logs</p>
                <div className="space-y-3">
                  {incidentLogs.map((log) => (
                    <div key={log.title} className="flex items-start gap-2.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          log.status === "critical" ? "bg-critical" : "bg-resolved"
                        }`}
                      />
                      <div>
                        <p className="text-[13px] text-slate-200">{log.title}</p>
                        <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                          {log.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-[#081523] border border-white/6 p-4">
                <p className="mono-label text-slate-500">System Efficiency</p>
                <p className="metric-value text-[26px] font-bold text-white mt-2">
                  94.2%
                </p>
                <div className="h-1.5 rounded-full bg-white/6 mt-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: "94.2%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/6 bg-[#03101c]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-12">
          <div className="grid md:grid-cols-[1.6fr_1fr_1fr] gap-8">
            <div>
              <h3 className="text-[15px] font-semibold text-white">
                City Infrastructure Portal
              </h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mt-3 max-w-xs">
                The definitive administrative hub for metropolitan lifecycle
                management and urban operational resilience.
              </p>
              <div className="flex items-center gap-4 mt-5 text-slate-600 text-lg">
                <span>✳</span>
                <span>◎</span>
                <span>◈</span>
              </div>
            </div>

            <div>
              <p className="mono-label text-slate-500 mb-4">Resources</p>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link}>
                    <span className="text-[13px] text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mono-label text-slate-500 mb-4">Support</p>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link}>
                    <span className="text-[13px] text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
