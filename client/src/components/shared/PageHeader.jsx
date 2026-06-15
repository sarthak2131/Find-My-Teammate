export default function PageHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  action,
  variant = "brand",
  children,
  stats,
}) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-[28px] border border-slate-200/50 bg-white/70 px-6 py-5 shadow-sm backdrop-blur-md page-enter group/hero dark:border-slate-800/50 dark:bg-slate-950/60 sm:px-7 sm:py-6">
      {/* Ambient background reflection decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/5 via-transparent to-accent-500/5 opacity-0 transition-opacity duration-500 group-hover/hero:opacity-100 pointer-events-none" />
      
      {/* Subtle particle circle decoration */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-500/10 blur-2xl dark:bg-brand-500/5" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-accent-500/10 blur-2xl dark:bg-accent-500/5" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-[1.65rem]">
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/30 bg-brand-50/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700 shadow-sm dark:border-brand-900/30 dark:bg-brand-950/50 dark:text-brand-300">
                {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 max-w-xl text-sm font-medium text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
          {stats?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2.5">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-slate-200/50 bg-slate-50/80 px-3.5 py-1.5 shadow-sm transition hover:scale-[1.02] dark:border-slate-800/50 dark:bg-slate-900/80"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{s.value}</p>
                  <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}


