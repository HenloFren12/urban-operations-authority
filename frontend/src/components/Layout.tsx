import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getUser, isAuthenticated, logout } from "../utils/auth";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/complaints", label: "Complaints", icon: "📋" },
  { path: "/workorders", label: "Work Orders", icon: "🔧" },
  { path: "/analytics", label: "Analytics", icon: "📈" },
  { path: "/audit", label: "Audit Logs", icon: "📜" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isAuthenticated();
  const user = getUser();
  const [collapsed, setCollapsed] = useState(false);

  const isHome = location.pathname === "/";
  const isLogin = location.pathname === "/login";

  // On the public home page (and login) we show a minimal top bar with only Login.
  // The full navigation menu + sidebar appear ONLY after the user is authenticated.
  const showFullChrome = authenticated && !isHome && !isLogin;

  const activeLabel = useMemo(() => {
    return (
      navItems.find((item) => location.pathname.startsWith(item.path))?.label ||
      "Dashboard"
    );
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ---------- PUBLIC / PRE-LOGIN LAYOUT (Home + Login) ----------
  if (!showFullChrome) {
    return (
      <div className="min-h-screen page-shell flex flex-col">
        <nav className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="flex items-center justify-between h-16">
              <NavLink to="/" className="flex items-center gap-2.5 min-w-0">
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-white whitespace-nowrap">
                  City Infrastructure Portal
                </span>
              </NavLink>

              <div className="flex items-center gap-3">
                {authenticated ? (
                  <>
                    <NavLink
                      to="/dashboard"
                      className="hidden sm:inline-flex text-[13px] text-slate-300 hover:text-white transition-colors duration-200 px-2"
                    >
                      Dashboard
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-1.5 rounded-md text-[12px] font-semibold bg-primary text-white btn-elevate"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <NavLink
                    to="/login"
                    className="px-5 py-1.5 rounded-md text-[12px] font-semibold bg-primary text-white btn-elevate"
                  >
                    Login
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // ---------- AUTHENTICATED APP LAYOUT (Dashboard, etc.) ----------
  return (
    <div className="min-h-screen page-shell">
      <nav className="sticky top-0 z-50 border-b border-white/6 bg-[#04111dcc]/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <NavLink to="/dashboard" className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl surface-panel flex items-center justify-center shrink-0">
                  <img
                    src="/images/karnataka-emblem.png"
                    alt="Karnataka Emblem"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div className="min-w-0 hidden sm:block">
                  <div className="text-[15px] font-semibold tracking-[-0.02em] text-white truncate">
                    Urban Operations Authority
                  </div>
                  <div className="mono-label text-accent/90 truncate">
                    Government of Karnataka
                  </div>
                </div>
              </NavLink>

              <div className="hidden xl:flex items-center gap-1.5 ml-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link px-3.5 py-2 rounded-xl text-[13px] font-medium ${
                        isActive
                          ? "glass-active text-white active-link"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      }`
                    }
                  >
                    <span className="mr-1.5 opacity-90">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 auth-fade">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl surface-panel-soft border border-white/6">
                <div className="w-2 h-2 rounded-full bg-resolved pulse-dot" />
                <span className="text-[12px] text-slate-300 font-medium">
                  {activeLabel}
                </span>
              </div>

              <div className="px-3 py-2 rounded-xl surface-panel-soft hidden sm:flex items-center gap-2 min-w-0">
                <span className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.08em]">
                  User
                </span>
                <span className="text-[13px] text-white truncate max-w-[200px]">
                  {user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl text-[12px] font-medium text-slate-200 surface-panel-soft hover:bg-white/[0.04] border border-white/6 btn-elevate"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="xl:hidden border-t border-white/6 overflow-x-auto">
          <div className="flex items-center gap-1 px-4 sm:px-6 py-2.5 min-w-max">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap ${
                    isActive
                      ? "glass-active text-white active-link"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  }`
                }
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 flex gap-6">
        <aside
          className={`hidden xl:flex sidebar-shell shrink-0 ${collapsed ? "w-[88px]" : "w-[248px]"}`}
        >
          <div className="surface-panel rounded-2xl p-3 w-full h-fit sticky top-[96px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className={`min-w-0 ${collapsed ? "hidden" : "block"}`}>
                <p className="section-eyebrow">Navigation</p>
                <p className="text-[14px] text-slate-300 font-medium mt-1">
                  Civic control panel
                </p>
              </div>
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="w-9 h-9 rounded-xl surface-panel-soft btn-elevate text-slate-300 flex items-center justify-center"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? "»" : "«"}
              </button>
            </div>

            <div className="space-y-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? "active-sidebar" : "text-slate-400"} flex items-center gap-3 rounded-xl px-3 py-3`
                  }
                >
                  <span className="sidebar-icon text-base w-5 text-center shrink-0">
                    {item.icon}
                  </span>
                  <span
                    className={`sidebar-label text-[13px] font-medium whitespace-nowrap ${
                      collapsed
                        ? "opacity-0 -translate-x-1 pointer-events-none w-0 overflow-hidden"
                        : "opacity-100 translate-x-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/6">
              <div
                className={`rounded-xl surface-panel-soft px-3 py-3 ${collapsed ? "text-center" : ""}`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-accent marker-pulse mx-auto xl:mx-0" />
                <div
                  className={`sidebar-label mt-2 ${collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"}`}
                >
                  <p className="mono-label">System</p>
                  <p className="text-[13px] text-slate-300 mt-1">
                    Operational integrity stable
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <main className="page-enter">{children}</main>

          <footer className="mt-10 pb-6">
            <div className="surface-panel-soft rounded-2xl px-5 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <p className="text-[12px] text-slate-400 leading-relaxed">
                Urban Operations Authority · Government of Karnataka · Digital
                Governance Initiative
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono uppercase tracking-[0.08em]">
                <span>Secure Civic Operations</span>
                <span className="hidden sm:inline">•</span>
                <span>Administrative Platform</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
