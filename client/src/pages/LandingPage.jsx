import {
  ArrowRight,
  MessageSquare,
  Search,
  ShieldCheck,
  Users,
  Sparkles,
  Star,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PublicLayout from "../components/layout/PublicLayout";

const features = [
  {
    title: "Smart skill matching",
    description: "Filter by React, Python, UI/UX, AI/ML — find people who actually fit your project.",
    icon: Search,
  },
  {
    title: "Project workspaces",
    description: "Post hackathon ideas, set deadlines, list required roles, and manage applications.",
    icon: Users,
  },
  {
    title: "Live messaging",
    description: "See who's online, chat in real time, and keep your squad aligned without switching apps.",
    icon: MessageSquare,
  },
  {
    title: "Safe & private",
    description: "Secure auth, private profiles, and thoughtful controls for team preferences.",
    icon: ShieldCheck,
  },
];

const testimonials = [
  {
    quote: "Found my entire hackathon team in 2 hours. The skill tags made it stupidly easy.",
    name: "Priya S.",
    role: "CS undergrad, IIT",
    stars: 5,
  },
  {
    quote: "Finally stopped spamming WhatsApp groups. Posted once, got 12 solid applications.",
    name: "Arjun M.",
    role: "Full-stack builder",
    stars: 5,
  },
  {
    quote: "The dashboard alone saved us — incoming requests, bookmarks, everything in one place.",
    name: "Sneha K.",
    role: "Project lead",
    stars: 5,
  },
];

const steps = [
  { step: "01", title: "Create your profile", desc: "Add skills, bio, GitHub, and availability." },
  { step: "02", title: "Post or discover", desc: "Browse open projects or publish your own squad call." },
  { step: "03", title: "Connect & ship", desc: "Apply, chat, accept teammates — then build." },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:pb-28">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-400/15 blur-3xl dark:bg-brand-500/20" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-accent-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="page-enter mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5" />
              Built for hackathons, college projects & startups
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Find teammates who{" "}
              <span className="gradient-text">actually ship</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Stop scrolling endless group chats. Match by skills, form squads in minutes, and collaborate with real-time chat — all in one beautiful workspace.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
                Start free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-3.5 text-base">
                Sign in
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              {["No credit card", "Demo accounts ready", "Dark mode"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Stats bento */}
          <div className="page-enter mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              { label: "Open projects", value: "128+", accent: "brand" },
              { label: "Builders online", value: "2.4K", accent: "mint" },
              { label: "Teams formed", value: "3,892", accent: "coral" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="surface-muted rounded-2xl p-6 text-center transition-transform hover:-translate-y-1"
              >
                <p className="font-display text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200/80 bg-white/50 px-4 py-16 dark:border-white/10 dark:bg-white/[0.02] sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold text-slate-900 dark:text-white">
            Three steps to your dream team
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <span className="font-display text-5xl font-bold text-brand-500/20">{step}</span>
                <h3 className="mt-2 text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold text-slate-900 dark:text-white">
            Everything you need to collaborate
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
            From discovery to delivery — one platform, zero chaos.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="surface group transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow dark:hover:border-brand-600/40"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold text-slate-900 dark:text-white">
            Loved by builders
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="surface-muted rounded-2xl p-6">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-4 text-sm font-bold text-slate-800 dark:text-white">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 mb-16 sm:mx-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-hero-brand p-10 text-center text-white shadow-glow sm:p-14">
          <Zap className="mx-auto h-10 w-10 opacity-90" />
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
            Ready to find your teammate?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-brand-100">
            Join the community today. Your next hackathon win starts with the right squad.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-brand-700 transition hover:scale-[1.02] hover:shadow-lg"
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
