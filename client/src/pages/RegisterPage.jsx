import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { USER_GENDER_OPTIONS } from "../utils/genderPreferences";
import AuthLayout from "../components/layout/AuthLayout";
import { Mail, Lock, ShieldAlert, Loader2, ArrowRight, User, Search, MessageSquare, ShieldCheck } from "lucide-react";

const features = [
  { icon: Search, title: "Skill matching", desc: "Find people by React, Python, design & more." },
  { icon: MessageSquare, title: "Live chat", desc: "Message teammates without leaving the app." },
  { icon: ShieldCheck, title: "Project hub", desc: "Post ideas, manage applications, build squads." },
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

  const sidePanel = (
    <>
      <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-400/40 bg-accent-500/20 px-3 py-1 text-xs font-bold text-accent-200">
        Free for students
      </span>
      <h1 className="font-display text-4xl font-bold text-white">
        Join the <span className="text-accent-400">builder</span> community
      </h1>
      <p className="mt-4 text-sm text-brand-100/90">Build your profile and find hackathon teammates in minutes.</p>
      <div className="mt-8 space-y-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex gap-3 rounded-xl border border-brand-600/40 bg-brand-950/40 p-4">
              <Icon className="h-5 w-5 shrink-0 text-accent-400" />
              <div>
                <p className="font-bold text-white text-sm">{f.title}</p>
                <p className="text-xs text-brand-200/80">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <AuthLayout sidePanel={sidePanel}>
      <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Create account</h2>
      <p className="mt-1 text-sm text-slate-500">Start your teammate journey</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 text-xs font-bold text-brand-700 dark:text-brand-400">Name</span>
          <div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
            <input className="input pl-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 text-xs font-bold text-brand-700 dark:text-brand-400">Email</span>
          <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
            <input className="input pl-10" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 text-xs font-bold text-brand-700 dark:text-brand-400">Password</span>
          <div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
            <input className="input pl-10" type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 text-xs font-bold text-brand-700 dark:text-brand-400">Gender (optional)</span>
          <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            {USER_GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        {error && <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign up <ArrowRight className="h-4 w-4" /></>}
        </button>
        <p className="text-center text-sm text-slate-500">
          Have an account? <Link to="/login" className="font-bold text-brand-600 hover:text-brand-500">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
