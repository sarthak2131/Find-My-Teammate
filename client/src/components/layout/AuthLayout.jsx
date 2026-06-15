import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import BrandLogo from "../shared/BrandLogo";
import useTheme from "../../hooks/useTheme";

export default function AuthLayout({ children, sidePanel }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden font-body">
      <div className="auth-bg" />
      <div className="pointer-events-none absolute inset-0 festival-grid opacity-25" />

      <header className="relative z-20 px-4 pt-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0, ease: "easeOut" }}
          className="mx-auto flex h-20 max-w-7xl items-center justify-between rounded-[28px] border border-slate-200/50 bg-white/70 px-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:shadow-festival"
        >
          <BrandLogo to="/" size="sm" />
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100/50 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white transition"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 hover:border-orange-500 hover:bg-white transition-all hover:scale-[1.05] active:scale-[0.95] dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-orange-500 dark:hover:bg-white/10"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </motion.div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl gap-6 px-4 pb-12 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        {sidePanel && (
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            className="auth-poster-panel flex min-h-[320px] flex-col justify-between p-8 sm:p-10"
          >
            <div className="absolute right-6 top-6 hidden rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/80 sm:block">
              Campus edition
            </div>
            <div className="relative z-10">
              {typeof sidePanel === "function" ? sidePanel(theme) : sidePanel}
            </div>
          </motion.aside>
        )}

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="festival-card relative flex flex-col justify-center overflow-hidden p-6 sm:p-10"
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent dark:via-orange-500/40" />
          <div className="pointer-events-none absolute -right-20 top-10 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-600/15" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="relative z-10">{children}</div>
        </motion.section>
      </div>
    </div>
  );
}
