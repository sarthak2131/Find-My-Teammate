import { Bookmark, Calendar, Trash2, UserPlus, Check, Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/formatters";
import { getProjectEligibility, getProjectGenderLabel } from "../../utils/genderPreferences";
import {
  getProjectCapacity,
  getProjectFitInsights,
  getProjectOpenSpots,
  getProjectTimelineInsight,
} from "../../utils/projectInsights";
import Avatar from "./Avatar";

const CARD_GRADIENTS = [
  "from-brand-700 to-brand-500",
  "from-brand-600 to-accent-500",
  "from-brand-800 to-brand-600",
  "from-accent-600 to-brand-600",
  "from-brand-500 to-brand-400",
  "from-brand-900 to-accent-600",
];

export default function ProjectCard({
  project,
  currentUser,
  onRequestJoin,
  onBookmark,
  onDelete,
  projectRequest,
  hideOwnerInfo = false,
  onReport,
}) {
  const navigate = useNavigate();
  const isOwner = project.createdBy?._id === currentUser?._id;
  const isMember = project.members?.some((m) => m._id === currentUser?._id);
  const isBookmarked = currentUser?.bookmarks?.includes(project._id);
  const eligibility = getProjectEligibility({ project, user: currentUser });
  const fitInsights = getProjectFitInsights(project, currentUser);
  const openSpots = getProjectOpenSpots(project);
  const capacity = getProjectCapacity(project);
  const timeline = getProjectTimelineInsight(project);
  const isFull = openSpots === 0;
  const canApply = eligibility.allowed && !isFull;
  const hash = project._id?.split("").reduce((a, c) => a + c.charCodeAt(0), 0) || 0;
  const gradientClass = CARD_GRADIENTS[hash % CARD_GRADIENTS.length];

  const openProject = () => navigate(`/projects/${project._id}`);
  const stop = (e) => e.stopPropagation();

  const isVideo =
    project.posterUrl &&
    (project.posterUrl.startsWith("data:video/") || /\.(mp4|webm|ogg|mov)($|\?)/i.test(project.posterUrl));

  const showHeader = !hideOwnerInfo || isOwner;

  return (
    <article
      className="surface group flex h-full cursor-pointer flex-col overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-glow"
      onClick={openProject}
    >
      {showHeader && (
        <div className="flex items-center justify-between border-b border-slate-200/80 p-4 dark:border-slate-700/50">
          {!hideOwnerInfo ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-xl ring-2 ring-brand-300">
                <Avatar src={project.createdBy?.avatar || project.createdBy?.profileImage?.url} alt={project.createdBy?.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <Link to={`/profile/${project.createdBy?._id}`} onClick={stop} className="text-sm font-bold text-slate-800 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">
                  {project.createdBy?.name || "Anonymous"}
                </Link>
              </div>
            </div>
          ) : (
            <div />
          )}
          {isOwner && (
            <div className="flex gap-1" onClick={stop}>
              <Link to={`/projects/${project._id}/edit`} className="rounded-lg p-2 text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800/60"><Pencil className="h-4 w-4" /></Link>
              {onDelete && (
                <button type="button" onClick={() => onDelete(project._id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          )}
        </div>
      )}

      {project.posterUrl ? (
        <div className="relative max-h-[320px] min-h-[180px] bg-brand-950">
          {isVideo ? <video src={project.posterUrl} className="max-h-[320px] w-full object-contain" muted loop playsInline controls /> : (
            <img src={project.posterUrl} alt={project.title} className="max-h-[320px] w-full object-contain" />
          )}
          <span className="absolute right-2 top-2 chip-accent">{project.status || "open"}</span>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-950 to-transparent p-4">
            <h3 className="font-display text-lg font-bold text-white">{project.title}</h3>
          </div>
        </div>
      ) : (
        <div className={`flex h-32 flex-col justify-end bg-gradient-to-br ${gradientClass} p-4`}>
          <span className="absolute right-2 top-2 rounded-lg bg-black/30 px-2 py-0.5 text-[10px] font-bold text-white">{project.status || "open"}</span>
          <h3 className="font-display text-lg font-bold text-white">{project.title}</h3>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{project.description}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-brand-100 bg-brand-50/70 px-3 py-2 dark:border-brand-900/40 dark:bg-brand-950/30">
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">Match score</p>
            <p className="mt-1 text-sm font-extrabold text-brand-800 dark:text-white">{fitInsights.fitScore}%</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{fitInsights.verdict}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-700/50 dark:bg-slate-900/40">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Open spots</p>
            <p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-white">{openSpots}/{capacity}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{isFull ? "Team full" : "Seats available"}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.preferredGender && project.preferredGender !== "any" && <span className="chip">{getProjectGenderLabel(project.preferredGender)}</span>}
          {fitInsights.matchedSkills.slice(0, 2).map((skill) => (
            <span key={`match-${skill}`} className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              Match: {skill}
            </span>
          ))}
          {(project.requiredSkills || []).map((s) => (
            <span key={s} className="rounded-lg bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-800 dark:bg-brand-950/50 dark:text-brand-300">{s}</span>
          ))}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
            style={{ width: `${Math.max(8, Math.round(((project.members?.length || 0) / capacity) * 100))}%` }}
          />
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-200/80 pt-3 text-xs text-slate-500 dark:border-slate-700/50">
          <span>{project.members?.length || 1}/{capacity} members</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{timeline.label || formatDate(project.deadline)}</span>
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-200/80 bg-slate-50/50 p-2 dark:border-slate-700/50 dark:bg-slate-800/30" onClick={stop}>
        <button type="button" onClick={() => onBookmark?.(project._id)} className={`rounded-xl px-3 py-2 text-xs font-bold ${isBookmarked ? "bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300" : "text-slate-500 hover:bg-white dark:hover:bg-slate-700/50"}`}>
          <Bookmark className={`inline h-3.5 w-3.5 ${isBookmarked ? "fill-current" : ""}`} /> {isBookmarked ? "Saved" : "Save"}
        </button>
        {!isOwner && onReport && (
          <button type="button" onClick={() => onReport(project)} className="rounded-xl px-2.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
            Report
          </button>
        )}
        {isOwner || isMember ? (
          <button type="button" onClick={openProject} className="btn-secondary flex-1 py-2 text-xs">Manage</button>
        ) : projectRequest ? (
          <button type="button" disabled className="flex-1 rounded-xl bg-accent-100 py-2 text-xs font-bold text-accent-700">{projectRequest.status}</button>
        ) : onRequestJoin ? (
          <button type="button" disabled={!canApply} onClick={() => canApply && onRequestJoin(project)} className={`flex-1 py-2 text-xs font-bold ${canApply ? "btn-primary" : "opacity-50"}`}>
            <UserPlus className="inline h-3.5 w-3.5" /> {isFull ? "Team full" : "Apply"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
