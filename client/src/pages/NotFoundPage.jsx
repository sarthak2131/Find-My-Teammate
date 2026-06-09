import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import BrandLogo from "../components/shared/BrandLogo";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 font-body">
      <BrandLogo to="/" size="lg" className="mb-8" />
      <div className="surface max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-500">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          This page doesn&apos;t exist or was moved. Head back to discover projects and teammates.
        </p>
        <Link to="/feed" className="btn-primary mt-6">
          <Home className="h-4 w-4" />
          Go to Discover
        </Link>
      </div>
    </div>
  );
}
