import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/layout/AuthLayout";
import { Mail, Lock, ShieldAlert, Loader2, ArrowRight, Sparkles, Users, Rocket, Zap } from "lucide-react";

const demoAccounts = [
  { label: "Project Lead", email: "lead.demo@fmt.com", password: "demo12345", badge: "Lead", color: "border-brand-500/20 bg-brand-500/5" },
  { label: "Builder", email: "builder.demo@fmt.com", password: "demo12345", badge: "Builder", color: "border-accent-400/30 bg-accent-500/10" },
  { label: "Admin", email: "admin.demo@fmt.com", password: "demo12345", badge: "Admin", color: "border-brand-500/20 bg-white/5" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isSubmitting, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to="/feed" replace />;

  const signIn = async (credentials) => {
    try {
      await login(credentials);
      navigate(location.state?.from?.pathname || "/feed", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in. Is the API server running?");
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signIn(form);
    } catch {
      /* error already set in signIn */
    }
  };

  const sidePanel = (
    <>
      <div>
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/20 px-3 py-1 text-xs font-bold text-brand-200">
          <Sparkles className="h-3.5 w-3.5 text-accent-400" /> Welcome back
        </span>
        <h1 className="font-display text-4xl font-bold leading-tight text-white">
          Find your <span className="text-accent-400">perfect teammate</span>
        </h1>
        <p className="mt-4 max-w-md text-sm text-brand-100/90">
          Hackathons, college projects, startups — match by skills and ship together.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-3 border-y border-brand-700/50 py-6">
          {[
            { icon: Users, label: "Builders", value: "14K+" },
            { icon: Rocket, label: "Teams", value: "3.8K" },
            { icon: Zap, label: "Match rate", value: "98%" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-bold uppercase text-brand-300/80">{label}</p>
              <p className="mt-1 flex items-center gap-1 font-display text-lg font-bold text-white">
                <Icon className="h-4 w-4 text-accent-400" /> {value}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-wide text-brand-300">Quick demo login</p>
        <div className="mt-2 space-y-2">
          {demoAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              disabled={isSubmitting}
              onClick={() => signIn({ email: acc.email, password: acc.password })}
              className={`flex w-full items-center justify-between rounded-xl border-2 p-3 text-left transition hover:scale-[1.01] ${acc.color}`}
            >
              <div>
                <span className="font-bold text-white">{acc.label}</span>
                <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-brand-200">{acc.badge}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-accent-400" />
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout sidePanel={sidePanel}>
      <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Sign in</h2>
      <p className="mt-1 text-sm text-slate-500">Your collaboration workspace awaits</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 text-xs font-bold text-brand-700 dark:text-brand-400">Email</span>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
            <input className="input pl-10" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 text-xs font-bold text-brand-700 dark:text-brand-400">Password</span>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
            <input className="input pl-10" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
        </label>
        {error && (
          <div className="flex gap-2 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <ShieldAlert className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
        </button>
        <p className="text-center text-sm text-slate-500">
          New? <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500">Create account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
