export default function ProjectCardSkeleton() {
  return (
    <div className="surface animate-pulse flex flex-col p-0 overflow-hidden h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/50">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 p-4 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
      
      {/* Banner / Poster area */}
      <div className="h-32 bg-slate-200 dark:bg-slate-700" />
      
      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4 space-y-4">
        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
        </div>
        
        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
        
        {/* Chips */}
        <div className="flex gap-1.5 flex-wrap">
          <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />

        {/* Footer */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-200/80 dark:border-slate-700/50">
          <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex gap-2 border-t border-slate-200/80 bg-slate-50/50 p-2 dark:border-slate-700/50 dark:bg-slate-800/30">
        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );
}
