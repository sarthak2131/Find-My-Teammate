import { Github, MessageCircle, Sparkles, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { getUserGenderLabel } from "../../utils/genderPreferences";

const CARD_BG = [
  "from-brand-500/5 to-accent-500/5",
  "from-accent-500/5 to-brand-500/5",
  "from-emerald-500/5 to-brand-500/5",
];

const DEFAULT_LOCATIONS = [
  "California, USA",
  "Sydney, Australia",
  "Delhi, India",
  "London, UK",
  "Berlin, Germany",
  "Tokyo, Japan",
];

export default function UserCard({ user, isOnline = false, extraAction = null, statusText = "" }) {
  const hash = user._id
    ? user._id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : 0;
  const gradientClass = CARD_BG[hash % CARD_BG.length];
  const location = DEFAULT_LOCATIONS[hash % DEFAULT_LOCATIONS.length];

  const getGithubUsername = (url) => {
    if (!url) return "";
    try {
      const parts = url.replace(/\/$/, "").split("/");
      return parts[parts.length - 1] ? `@${parts[parts.length - 1]}` : "GitHub";
    } catch {
      return "GitHub";
    }
  };

  const isAvailable =
    user.availability?.toLowerCase().includes("open") ||
    user.availability?.toLowerCase().includes("look") ||
    user.availability?.toLowerCase().includes("available") ||
    user.availability?.toLowerCase().includes("yes");

  return (
    <article
      className={`surface page-enter flex h-full flex-col overflow-hidden bg-gradient-to-br ${gradientClass} transition-all hover:-translate-y-1 hover:shadow-glow`}
    >
      <div className="flex items-start justify-between p-5 pb-2">
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <div
              className={`h-14 w-14 overflow-hidden rounded-2xl ring-2 ${
                isOnline ? "ring-emerald-500" : "ring-slate-200 dark:ring-white/10"
              }`}
            >
              <Avatar src={user.profileImage?.url} alt={user.name} className="h-full w-full object-cover" />
            </div>
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-ink" />
            )}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">{user.name}</h3>
            <p className="flex items-center gap-1 text-xs text-slate-500">
               <MapPin className="h-3 w-3" />
               {location}
            </p>
            {user.gender && user.gender !== "prefer-not-to-say" && (
              <span className="chip mt-1.5">{getUserGenderLabel(user.gender)}</span>
            )}
          </div>
        </div>
        <span
          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${
            isAvailable
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          {user.availability || "Available"}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-3">
        <p className="min-h-[40px] text-sm text-slate-600 dark:text-slate-300">
          {user.bio || "No bio yet — say hi and find out what they're building!"}
        </p>
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {(user.skills || []).length > 0 ? (
              (user.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300"
                >
                  <Sparkles className="h-2.5 w-2.5 text-brand-500" />
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs italic text-slate-400">No skills listed</span>
            )}
          </div>
        </div>
        {user.githubLink && (
          <a
            href={user.githubLink}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            <Github className="h-3.5 w-3.5" />
            {getGithubUsername(user.githubLink)}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 p-3 dark:border-white/10">
        <Link to={`/profile/${user._id}`} className="btn-secondary flex-1 py-2 text-xs">
          Profile
        </Link>
        <Link to={`/chat?user=${user._id}`} className="btn-secondary flex-1 py-2 text-xs">
          <MessageCircle className="h-3.5 w-3.5" />
          Chat
        </Link>
        {extraAction && <div className="w-full">{extraAction}</div>}
      </div>

      {statusText && (
        <p className="border-t border-brand-200/50 bg-brand-50/50 px-4 py-2 text-center text-[11px] font-medium text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/5 dark:text-brand-300">
          {statusText}
        </p>
      )}
    </article>
  );
}
