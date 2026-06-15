import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  Loader2,
  Lock,
  Mail,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { USER_GENDER_OPTIONS } from "../utils/genderPreferences";
import AuthLayout from "../components/layout/AuthLayout";

const features = [
  {
    icon: Search,
    title: "Skill-first discovery",
    description: "Get seen for what you can build, not just who already knows you.",
  },
  {
    icon: Users,
    title: "Hackathon squad flow",
    description: "From idea posting to invite acceptance, keep the full sprint in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Judge-friendly structure",
    description: "Profiles, project cards, requests, and messaging that feel organized during demos.",
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isSubmitting } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", gender: "prefer-not-to-say" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/feed", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account.");
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
            <Compass className={`h-3.5 w-3.5 ${isDarkTheme ? "text-orange-400" : "text-orange-500"}`} />
            Campus build circle
          </span>
          <h1 className={`mt-5 max-w-lg font-display text-4xl font-bold leading-[1.02] sm:text-5xl ${
            isDarkTheme ? "text-white" : "text-slate-900"
          }`}>
            Create a profile that makes people say,
            <span className={`mt-2 block ${isDarkTheme ? "text-orange-500" : "text-orange-600"}`}>“we need this person on our team.”</span>
          </h1>
          <p className={`mt-4 max-w-md text-base leading-relaxed ${
            isDarkTheme ? "text-white/72" : "text-slate-600"
          }`}>
            Whether you code, design, pitch, research, or manage delivery, your next great team should be able to find you fast.
          </p>
        </div>

        <div className="space-y-3">
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              whileHover={{ x: 4 }}
              className={`rounded-[24px] border p-4 ${
                isDarkTheme
                  ? "border-white/12 bg-white/10"
                  : "border-orange-100 bg-white/90 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-2xl p-3 ${
                  isDarkTheme ? "bg-white/10" : "bg-orange-50/60"
                }`}>
                  <Icon className={`h-5 w-5 ${isDarkTheme ? "text-orange-400" : "text-orange-500"}`} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDarkTheme ? "text-white" : "text-slate-900"}`}>{title}</p>
                  <p className={`mt-1 text-sm leading-relaxed ${
                    isDarkTheme ? "text-white/68" : "text-slate-600"
                  }`}>{description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }, []);

  return (
    <AuthLayout sidePanel={sidePanel}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <p className="festival-label">New builder</p>
        <h2 className="mt-2 font-display text-4xl font-bold text-slate-900 dark:text-white">
          Join the next winning squad
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Set up your presence once, then use it across hackathons, project showcases, and campus collaboration drives.
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
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Name</span>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
            <input
              className="input h-14 pl-11 text-base"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Email</span>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
            <input
              className="input h-14 pl-11 text-base"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@college.edu"
              required
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Password</span>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
            <input
              className="input h-14 pl-11 text-base"
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create a secure password"
              required
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Gender (optional)</span>
          <select
            className="input h-14 text-base"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            {USER_GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
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
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create my profile <ArrowRight className="h-4 w-4" /></>}
        </motion.button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-500">
            Sign in
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}
