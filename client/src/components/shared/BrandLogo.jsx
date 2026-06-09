import { Link } from "react-router-dom";
import { UsersRound } from "lucide-react";

export default function BrandLogo({ to = "/", size = "md", className = "", light = false }) {
  const sizes = {
    sm: { icon: "h-4 w-4", text: "text-base", box: "h-8 w-8" },
    md: { icon: "h-5 w-5", text: "text-lg", box: "h-10 w-10" },
    lg: { icon: "h-6 w-6", text: "text-2xl", box: "h-12 w-12" },
  };
  const s = sizes[size] || sizes.md;

  const content = (
    <>
      <span
        className={`flex ${s.box} shrink-0 items-center justify-center rounded-xl bg-brand-600 shadow-glow`}
      >
        <UsersRound className={`${s.icon} text-white`} />
      </span>
      <span className={`font-display font-bold tracking-tight ${s.text}`}>
        {light ? (
          <span className="text-white">Find My Teammate</span>
        ) : (
          <>
            <span className="text-brand-600 dark:text-brand-400">Find My</span>
            <span className="text-slate-800 dark:text-white"> Teammate</span>
          </>
        )}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`flex items-center gap-2.5 ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={`flex items-center gap-2.5 ${className}`}>{content}</div>;
}
