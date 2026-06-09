import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="surface max-w-md text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
            Loading workspace
          </p>
          <h1 className="mt-4 text-3xl font-bold">Reconnecting your teammate hub...</h1>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

