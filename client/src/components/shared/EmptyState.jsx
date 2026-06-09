import { Sparkles } from "lucide-react";

export default function EmptyState({ title, description, action }) {
  return (
    <div className="surface flex flex-col items-center py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
        <Sparkles className="h-7 w-7" />
      </div>
      <h3 className="font-display text-2xl font-bold text-slate-800 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
