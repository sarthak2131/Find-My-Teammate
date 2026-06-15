import { useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import BrandLogo from "../shared/BrandLogo";
import ThemeToggle from "../shared/ThemeToggle";

const navVariants = {
  hidden: { opacity: 0, y: -18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const links = [
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "Workflow" },
  { href: "#testimonials", label: "Impact" },
];

export default function PublicLayout({ children }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="festival-shell min-h-screen font-body">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-brand-500 via-brand-400 to-accent-400"
        style={{ scaleX }}
      />

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <motion.div
          variants={navVariants}
          initial="hidden"
          animate="show"
          className="group relative mx-auto flex h-20 max-w-7xl items-center justify-between rounded-full border border-brand-100/70 bg-white/80 px-6 shadow-card backdrop-blur-md transition-all duration-500 hover:border-brand-300/60 dark:border-slate-800/50 dark:bg-slate-950/60 dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)] dark:hover:border-accent-500/20"
        >
          {/* Ambient Glow Aura */}
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-brand-500/12 via-transparent to-accent-400/14 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />

          <BrandLogo to="/" className="transition hover:scale-[1.02] active:scale-[0.98] duration-300" />
          
          <nav className="hidden items-center gap-1 rounded-full border border-brand-100/70 bg-accent-50/70 p-1 dark:border-slate-800/30 dark:bg-slate-900/40 md:flex">
            {links.map((link, idx) => (
              <a
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600 transition duration-300 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                {hoveredIndex === idx && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 rounded-full border border-brand-100/70 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-800"
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition duration-300 hover:text-brand-600 dark:text-slate-300 dark:hover:text-accent-300 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="group/btn relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_18px_32px_-20px_rgba(243,107,33,0.75)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_22px_38px_-22px_rgba(243,107,33,0.82)] active:scale-[0.97]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-500 via-brand-400 to-accent-400 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
              <span className="relative z-10 flex items-center gap-1.5">
                Join the sprint
                <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
              </span>
            </Link>
            <ThemeToggle className="!rounded-full hover:scale-[1.05] active:scale-[0.95] duration-300 hover:rotate-12" />
          </div>
        </motion.div>
      </header>

      <main>{children}</main>

      <footer className="px-4 pb-10 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-[28px] border border-brand-100/80 bg-white/80 px-5 py-5 shadow-festival backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-950/65 sm:flex-row">
          <BrandLogo to="/" size="sm" />
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Built for college hackathons, campus teams, and ambitious demo nights.
          </p>
        </div>
      </footer>
    </div>
  );
}
