export default function UserCardSkeleton() {
  return (
    <div className="surface animate-pulse flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/50 h-full">
      <div className="flex items-start justify-between p-5 pb-2">
        <div className="flex gap-4">
          <div className="h-14 w-14 bg-slate-200 dark:bg-slate-700 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-3 space-y-4">
        {/* Bio */}
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
        </div>
        
        {/* Skills */}
        <div className="space-y-2">
          <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="flex flex-wrap gap-1.5">
            <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="flex flex-wrap gap-2 border-t border-slate-100 p-3 dark:border-white/10">
        <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );
}
