import { useState, useCallback, useMemo } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  KeyRound,
  Loader2,
  Mail,
  ShieldAlert,
  Sparkles,
  TimerReset,
  Trophy,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/layout/AuthLayout";

const demoAccounts = [
  {
    label: "Project Lead",
    email: "lead.demo@fmt.com",
    password: "demo12345",
    badge: "Lead lane",
    description: "Post ideas, review requests, shape the squad.",
  },
  {
    label: "Builder",
    email: "builder.demo@fmt.com",
    password: "demo12345",
    badge: "Dev lane",
    description: "Browse projects, join teams, and start shipping.",
  },
  {
    label: "Admin",
    email: "admin.demo@fmt.com",
    password: "demo12345",
    badge: "Ops lane",
    description: "See platform activity, health, and recent action.",
  },
];

const highlights = [
  { icon: Users, value: "Live squads", label: "Recruit with clarity, not chaos." },
  { icon: Trophy, value: "Demo-ready", label: "Built for judges, mentors, and sprint finals." },
  { icon: TimerReset, value: "Fast workflow", label: "Discover, invite, chat, and move in one loop." },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isSubmitting, isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/feed"} replace />;
  }

  const signIn = useCallback(async (credentials) => {
    try {
      const loggedInUser = await login(credentials);
      const targetPath = loggedInUser?.role === "admin" ? "/admin" : (location.state?.from?.pathname || "/feed");
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in. Start the API and database, then try again.");
      throw err;
    }
  }, [login, navigate, location.state?.from?.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signIn(form);
    } catch {
      // handled above
    }
  };

  const sidePanel = useMemo(() => (theme) => {
    const isDarkTheme = theme === "dark";

    return (
      <div className="space-y-8">
        <div>
          <span className={`festival-badge ${
            isDarkTheme
              ? "border-white/20 bg-white/10 text-white/80"
              : "!border-orange-100 !bg-white/90 !text-slate-700"
          }`}>
            <Sparkles className={`h-3.5 w-3.5 ${isDarkTheme ? "text-orange-400" : "text-orange-500"}`} />
            Weekend hackathon network
          </span>
          <h1 className={`mt-5 max-w-lg font-display text-4xl font-bold leading-[1.02] sm:text-5xl ${
            isDarkTheme ? "text-white" : "text-slate-900"
          }`}>
            Walk in with an idea.
            <span className={`mt-2 block ${isDarkTheme ? "text-orange-400" : "text-orange-500"}`}>Walk out with a team.</span>
          </h1>
          <p className={`mt-4 max-w-md text-base leading-relaxed ${
            isDarkTheme ? "text-white/72" : "text-slate-600"
          }`}>
            Built for college hackathons, campus innovation cells, and project demo weeks where the right teammate changes everything.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, value, label }) => (
            <div
              key={value}
              className={`rounded-[24px] border p-4 ${
                isDarkTheme
                  ? "border-white/12 bg-white/10"
                  : "border-orange-100 bg-white/90 shadow-sm"
              }`}
            >
              <Icon className={`h-5 w-5 ${isDarkTheme ? "text-orange-400" : "text-orange-500"}`} />
              <p className={`mt-4 text-sm font-bold uppercase tracking-[0.2em] ${
                isDarkTheme ? "text-white/55" : "text-slate-500"
              }`}>{value}</p>
              <p className={`mt-2 text-sm leading-relaxed ${
                isDarkTheme ? "text-white/82" : "text-slate-700"
              }`}>{label}</p>
            </div>
          ))}
        </div>

        <div className={`rounded-[28px] border p-5 ${
          isDarkTheme
            ? "border-white/12 bg-white/10"
            : "border-orange-100 bg-white/90 shadow-card"
        }`}>
          <div className="flex items-center justify-between gap-3">
            <p className={`text-sm font-bold uppercase tracking-[0.22em] ${
              isDarkTheme ? "text-white/60" : "text-slate-500"
            }`}>Quick demo login</p>
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${
              isDarkTheme
                ? "border border-white/15 text-orange-400"
                : "border border-orange-100 bg-orange-50 text-orange-700"
            }`}>
              One click
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {demoAccounts.map((acc) => (
              <motion.button
                key={acc.email}
                type="button"
                disabled={isSubmitting}
                onClick={() => signIn({ email: acc.email, password: acc.password })}
                whileHover={{ x: 6, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full rounded-[24px] border p-4 text-left transition ${
                  isDarkTheme
                    ? "border-white/15 bg-slate-950/35 hover:border-orange-500/50"
                    : "border-orange-100 bg-orange-50/40 hover:border-orange-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-lg font-bold ${isDarkTheme ? "text-white" : "text-slate-900"}`}>{acc.label}</p>
                    <p className={`mt-1 text-sm ${isDarkTheme ? "text-white/65" : "text-slate-600"}`}>{acc.description}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                    isDarkTheme
                      ? "bg-white/10 text-orange-400"
                      : "bg-white text-orange-600 border border-orange-100 shadow-sm"
                  }`}>
                    {acc.badge}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }, [isSubmitting, signIn]);

  return (
    <AuthLayout sidePanel={sidePanel}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <p className="festival-label">Team access</p>
        <h2 className="mt-2 font-display text-4xl font-bold text-slate-900 dark:text-white">
          Sign in to your sprint desk
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Open your project feed, review requests, and jump back into live coordination.
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Email</span>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
            <input
              className="input h-14 pl-11 text-base"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="lead.demo@fmt.com"
              required
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Password</span>
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
            <input
              className="input h-14 pl-11 text-base"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>
        </label>

        {error && (
          <div className="flex gap-3 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          className="btn-primary h-14 w-full text-base"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Enter workspace <ArrowRight className="h-4 w-4" /></>}
        </motion.button>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/50 dark:text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
            <BadgeCheck className="h-4 w-4 text-emerald-500" />
            Demo access hint
          </div>
          <p className="mt-1">Use the quick login cards on the left if you want to show the project instantly during a demo.</p>
        </div>

        <p className="text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500">
            Create your account
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}
