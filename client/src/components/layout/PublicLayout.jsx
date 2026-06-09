import { Link } from "react-router-dom";
import BrandLogo from "../shared/BrandLogo";
import ThemeToggle from "../shared/ThemeToggle";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen font-body">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-700/60 dark:bg-ink/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo to="/" />
          <nav className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get started</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200/80 py-8 dark:border-slate-700/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <BrandLogo to="/" size="sm" />
          <p className="text-sm text-slate-500">Find My Teammate · Team up. Ship faster.</p>
        </div>
      </footer>
    </div>
  );
}
