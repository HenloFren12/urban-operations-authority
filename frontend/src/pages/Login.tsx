import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEMO_CREDENTIALS, isAuthenticated, login } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (authenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [authenticated, navigate]);

  if (authenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const success = login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Please check your email and password.");
    }
    setLoading(false);
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError("");
  };

  return (
    <div className="min-h-[calc(100vh-220px)] grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-center">
      <section className="surface-panel rounded-3xl px-6 sm:px-8 py-8 sm:py-10 relative overflow-hidden order-2 lg:order-1">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,93,138,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(94,217,215,0.05),transparent_22%)]" />
        <div className="relative">
          <p className="section-eyebrow mb-3">Restricted access</p>
          <h1 className="page-title max-w-xl">Administrator sign-in</h1>
          <p className="body-copy text-slate-400 mt-4 max-w-xl">
            Secure access point for Urban Operations Authority officials managing complaint intake, work-order operations, compliance review, and civic analytics.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <div className="surface-panel-soft rounded-2xl p-5">
              <p className="mono-label text-slate-500">Governance scope</p>
              <p className="text-[15px] text-white font-medium mt-2">Urban infrastructure command</p>
              <p className="text-[13px] text-slate-500 mt-2 leading-6">Unified administrative control for municipal response workflows.</p>
            </div>
            <div className="surface-panel-soft rounded-2xl p-5">
              <p className="mono-label text-slate-500">Security note</p>
              <p className="text-[15px] text-white font-medium mt-2">Authorized personnel only</p>
              <p className="text-[13px] text-slate-500 mt-2 leading-6">Unauthorized access is prohibited and subject to audit review.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-panel rounded-3xl p-6 sm:p-8 order-1 lg:order-2">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl surface-panel-soft mx-auto flex items-center justify-center mb-4">
            <img src="/images/karnataka-emblem.png" alt="Karnataka Emblem" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="section-title">Urban Operations Authority</h2>
          <p className="text-[13px] text-slate-500 mt-2">Government of Karnataka administrative access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mono-label text-slate-500 mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@urbanops.gov"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#081523] border border-white/6 text-white text-[14px] placeholder-slate-600 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10"
            />
          </div>

          <div>
            <label className="block mono-label text-slate-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#081523] border border-white/6 text-white text-[14px] placeholder-slate-600 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-critical/10 border border-critical/20 text-critical text-[12px] font-medium badge-animate">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl text-[14px] font-semibold bg-accent text-[#03101d] btn-elevate disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#03101d]/30 border-t-[#03101d] rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-5 surface-panel-soft rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3 gap-3">
            <p className="section-eyebrow text-accent/90">Demo credentials</p>
            <button
              onClick={fillDemo}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-accent/10 text-accent hover:bg-accent/18 transition-all duration-200"
            >
              Auto-fill
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono-label text-slate-500 w-16">Email</span>
              <code className="text-[12px] font-mono text-slate-300 bg-[#081523] border border-white/6 px-2.5 py-1 rounded-lg">
                {DEMO_CREDENTIALS.email}
              </code>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono-label text-slate-500 w-16">Password</span>
              <code className="text-[12px] font-mono text-slate-300 bg-[#081523] border border-white/6 px-2.5 py-1 rounded-lg">
                {DEMO_CREDENTIALS.password}
              </code>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6 leading-6">
          This interface is intended for authorized Government of Karnataka personnel only.
        </p>
      </section>
    </div>
  );
}
