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
  const heroClass = variant === "accent" ? "page-hero-muted" : "page-hero";

  return (
    <div className={`${heroClass} page-enter`}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {badge && (
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5" />}
              {badge}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-white/85 leading-relaxed">{description}</p>
          )}
          {stats?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm"
                >
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[11px] font-medium text-white/75">{s.label}</p>
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
