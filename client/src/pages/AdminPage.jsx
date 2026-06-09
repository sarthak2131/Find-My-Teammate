import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/shared/StatCard";
import EmptyState from "../components/shared/EmptyState";
import Avatar from "../components/shared/Avatar";

export default function AdminPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      if (user?.role !== "admin") {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get("/users/admin/overview");
        setOverview(data);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [user]);

  if (user?.role !== "admin") {
    return (
      <EmptyState
        title="Admin access only"
        description="This panel is reserved for users with the admin role."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface page-enter">
        <div className="flex items-center gap-4">
          <div className="rounded-3xl bg-brand-50 p-4 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Admin panel</p>
            <h1 className="mt-2 text-4xl font-bold">Platform overview and recent activity.</h1>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="surface text-center text-sm text-slate-500 dark:text-slate-400">
          Loading admin analytics...
        </div>
      ) : null}

      {overview ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <StatCard label="Users" value={overview.stats.userCount} />
            <StatCard label="Projects" value={overview.stats.projectCount} accent="coral" />
            <StatCard label="Requests" value={overview.stats.requestCount} />
            <StatCard label="Notifications" value={overview.stats.notificationCount} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="surface">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Recent users</p>
              <div className="mt-6 space-y-4">
                {overview.recentUsers.map((recentUser) => (
                  <div key={recentUser._id} className="surface-muted flex items-center gap-4">
                    <Avatar
                      src={recentUser.profileImage?.url}
                      alt={recentUser.name}
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="font-semibold">{recentUser.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{recentUser.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Recent projects</p>
              <div className="mt-6 space-y-4">
                {overview.recentProjects.map((project) => (
                  <div key={project._id} className="surface-muted">
                    <p className="font-semibold">{project.title}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {project.createdBy?.name || "Unknown creator"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
