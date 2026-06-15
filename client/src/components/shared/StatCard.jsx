import { BarChart3, Heart, Layers } from "lucide-react";

const icons = {
  brand: Layers,
  coral: Heart,
  mint: BarChart3,
};

const styles = {
  brand: {
    border: "border-brand-100/60 dark:border-brand-950/40",
    iconBox: "text-brand-600 bg-brand-50/60 border-brand-100/60 dark:text-brand-400 dark:bg-brand-950/40 dark:border-brand-900/30",
    accentLine: "bg-brand-500",
    bgGradient: "from-brand-500/5 to-transparent",
    glow: "rgba(243, 107, 33, 0.14)",
  },
  coral: {
    border: "border-accent-100/60 dark:border-accent-950/40",
    iconBox: "text-accent-600 bg-accent-50/60 border-accent-100/60 dark:text-accent-400 dark:bg-accent-950/40 dark:border-accent-900/30",
    accentLine: "bg-accent-500",
    bgGradient: "from-accent-500/5 to-transparent",
    glow: "rgba(234, 181, 89, 0.14)",
  },
  mint: {
    border: "border-emerald-100/60 dark:border-emerald-950/40",
    iconBox: "text-emerald-600 bg-emerald-50/60 border-emerald-100/60 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900/30",
    accentLine: "bg-emerald-500",
    bgGradient: "from-emerald-500/5 to-transparent",
    glow: "rgba(16, 185, 129, 0.12)",
  },
};

export default function StatCard({ label, value, accent = "brand" }) {
  const Icon = icons[accent] || icons.brand;
  const currentStyle = styles[accent] || styles.brand;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/25 dark:bg-slate-950/60 backdrop-blur-md ${currentStyle.border}`}
      style={{
        boxShadow: `0 8px 30px -10px rgba(7, 16, 24, 0.05)`,
      }}
    >
      {/* Background gradient overlay on hover */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${currentStyle.bgGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} 
      />

      {/* Accent strip on left side */}
      <div className={`absolute bottom-0 left-0 top-0 w-1 transition-all duration-300 group-hover:w-1.5 ${currentStyle.accentLine}`} />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
        <div 
          className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 ${currentStyle.iconBox}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      {/* Decorative corner glow */}
      <div 
        className="absolute -right-4 -top-4 h-20 w-20 rounded-full blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: currentStyle.glow,
        }}
      />
    </div>

  );
}
