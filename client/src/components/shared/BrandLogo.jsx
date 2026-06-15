import { Link } from "react-router-dom";

export default function BrandLogo({ to = "/", size = "md", className = "" }) {
  const heights = {
    sm: "h-8 sm:h-9",
    md: "h-10 sm:h-11",
    lg: "h-12 sm:h-14",
  };
  const textSizes = {
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
  };
  const h = heights[size] || heights.md;
  const ts = textSizes[size] || textSizes.md;

  const content = (
    <>
      <img
        src="/logo.png"
        alt="Find My Teammate logo"
        className={`${h} w-auto object-contain`}
      />
      <span className={`font-display font-bold tracking-tight text-slate-900 dark:text-white ${ts} ml-2.5`}>
        Find My <span className="text-orange-500">Teammate</span>
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`inline-flex items-center ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={`inline-flex items-center ${className}`}>{content}</div>;
}
