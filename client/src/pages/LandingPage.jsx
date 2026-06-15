import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Compass,
  MessageSquare,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PublicLayout from "../components/layout/PublicLayout";

const heroCards = [
  { title: "Build lanes", value: "Frontend • Backend • AI • Design" },
  { title: "Decision speed", value: "Apply, approve, chat in one flow" },
  { title: "Demo pressure", value: "Made for 24h, 36h, and 48h sprints" },
];

const pillars = [
  {
    icon: Search,
    title: "Skill-first discovery",
    description: "Stop relying on random group messages. Search builders by the exact stack your hackathon idea needs.",
  },
  {
    icon: Users,
    title: "Project-led squad building",
    description: "Post an idea with roles, deadlines, and team preferences so responses feel structured from the start.",
  },
  {
    icon: MessageSquare,
    title: "Realtime coordination",
    description: "Jump from request approval to live messaging without shifting to three different apps.",
  },
  {
    icon: ShieldCheck,
    title: "Judge-ready workflow",
    description: "Everything looks cleaner in front of faculty: roles, requests, profiles, and project ownership are visible.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create a serious builder profile",
    description: "Add skills, interests, GitHub, and availability so people know what you actually bring to the table.",
  },
  {
    step: "02",
    title: "Open a squad call or browse teams",
    description: "Post your hackathon idea or explore open projects ranked by relevance, capacity, and fit.",
  },
  {
    step: "03",
    title: "Invite, accept, and ship",
    description: "Approve teammates, chat fast, and lock the team before the sprint energy disappears.",
  },
];

const testimonials = [
  {
    quote: "We used to beg for teammates in five WhatsApp groups. This made our selection process look professional.",
    name: "Campus Innovation Cell",
    role: "Organising team",
  },
  {
    quote: "The project cards and request workflow made our faculty demo feel like a real product, not a class assignment.",
    name: "MCA Product Squad",
    role: "Major project team",
  },
  {
    quote: "The biggest win was speed. We found the right people and started building before other teams even formed.",
    name: "48-Hour Hackathon Finalists",
    role: "Student builders",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <PublicLayout>
      <section className="px-4 pb-16 pt-8 sm:px-6 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial="hidden" animate="show" variants={reveal} custom={0.04}>
              <span className="festival-badge">
                <Sparkles className="h-3.5 w-3.5 text-accent-500" />
                College hackathon edition
              </span>
              <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[0.96] text-slate-950 sm:text-6xl xl:text-7xl">
                From chaotic group chats
                <span className="mt-3 block text-brand-600">to serious campus squads.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                Find My Teammate is built for college hackathons, major projects, startup weekends, and innovation cells that need fast, clean team formation.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary px-7 py-3.5 text-base">
                  Create builder profile
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/login" className="btn-secondary px-7 py-3.5 text-base">
                  Open workspace
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Team formation", value: "Fast" },
                  { label: "Project visibility", value: "Structured" },
                  { label: "Demo impression", value: "Strong" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial="hidden"
                    animate="show"
                    variants={reveal}
                    custom={0.1 + index * 0.06}
                    className="festival-card p-4"
                  >
                    <p className="festival-label">{stat.label}</p>
                    <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: "easeOut" }}
              className="poster-panel p-6 sm:p-8"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">Hackathon command board</p>
                    <h2 className="mt-2 font-display text-3xl font-bold text-white">Launch a team that looks organized before the build even starts.</h2>
                  </div>
                  <div className="hidden rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-accent-200 sm:block">
                    Sprint mode
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  {heroCards.map((card, index) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: 0.22 + index * 0.08 }}
                      className="rounded-[26px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">{card.title}</p>
                      <p className="mt-2 text-lg font-bold text-white">{card.value}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[26px] border border-white/12 bg-slate-950/35 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Why it works</p>
                    <p className="mt-3 text-sm leading-relaxed text-white/75">
                      The platform turns discovery, request handling, and teammate communication into one clear pipeline.
                    </p>
                  </div>
                  <div className="rounded-[26px] border border-white/12 bg-slate-950/35 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Built for demo day</p>
                    <p className="mt-3 text-sm leading-relaxed text-white/75">
                      It is not just useful to students. It also presents beautifully in front of mentors and faculty.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6" id="features">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {pillars.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={reveal}
              custom={0.04 + index * 0.06}
              className="festival-card p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-glow">
                <Icon className="h-5 w-5 text-accent-300" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6" id="workflow">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
            className="festival-card overflow-hidden p-8 sm:p-10"
          >
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <span className="festival-badge">
                  <Briefcase className="h-3.5 w-3.5 text-brand-600" />
                  What faculty notices
                </span>
                <h2 className="mt-5 font-display text-4xl font-bold text-slate-950 dark:text-white">
                  Your workflow starts to look like a real product, not a random student tool.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  Clear roles, controlled invites, live communication, and project ownership create a polished experience that stands out during reviews.
                </p>
              </div>

              <div className="space-y-5">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={reveal}
                    custom={0.08 + index * 0.06}
                    className="rounded-[26px] border border-slate-200 bg-slate-50/75 p-5 dark:border-slate-700/60 dark:bg-slate-900/45"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-6" id="testimonials">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="festival-label">Proof of impression</p>
              <h2 className="mt-2 font-display text-4xl font-bold text-slate-950 dark:text-white">What this changes in the room</h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm md:flex">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Stronger demo narrative
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <motion.div
                key={item.name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={reveal}
                custom={0.04 + index * 0.05}
                className="festival-card p-6"
              >
                <div className="mb-4 flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Trophy key={starIndex} className="h-4 w-4" />
                  ))}
                </div>
                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                  “{item.quote}”
                </p>
                <p className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-slate-500">{item.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
            className="poster-panel p-8 text-center sm:p-12"
          >
            <div className="relative z-10 mx-auto max-w-3xl">
              <Zap className="mx-auto h-10 w-10 text-accent-300" />
              <h2 className="mt-5 font-display text-4xl font-bold text-white sm:text-5xl">
                Make your next college project feel like a real product sprint.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/72">
                Create your workspace, invite your team, and show a product that feels organized before a single slide appears.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/register" className="rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:scale-[1.02]">
                  Start building
                </Link>
                <Link to="/login" className="rounded-2xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/15">
                  View demo login
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
