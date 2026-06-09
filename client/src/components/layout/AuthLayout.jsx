import { Link } from "react-router-dom";
import BrandLogo from "../shared/BrandLogo";
import ThemeToggle from "../shared/ThemeToggle";

export default function AuthLayout({ children, sidePanel }) {
  return (
    <div className="relative min-h-screen font-body">
      <div className="auth-bg" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]" />

      <header className="relative z-20 flex items-center justify-between px-4 py-5 sm:px-8">
        <BrandLogo to="/" light />
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm font-medium text-brand-200 hover:text-white">
            Home
          </Link>
          <ThemeToggle className="!border-white/20 !bg-white/10 !text-white hover:!border-brand-300" />
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-2 lg:flex-row lg:px-8">
        {sidePanel && (
          <div className="page-enter flex flex-1 flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur-xl lg:max-w-[52%]">
            {sidePanel}
          </div>
        )}
        <div className="page-enter flex flex-1 flex-col justify-center rounded-2xl border border-slate-200/80 bg-white p-8 shadow-card dark:border-slate-600/60 dark:bg-surface-dark sm:p-10 lg:max-w-[48%]">
          {children}
        </div>
      </div>
    </div>
  );
}
