import { useEffect, useState } from "react";
import { Check, X, ShieldAlert, Users, LayoutDashboard, BadgeCheck, Plus, Trophy, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/shared/StatCard";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import { getProjectEligibility } from "../utils/genderPreferences";
import { getProjectOpenSpots, getProjectReadiness, isProjectFull } from "../utils/projectInsights";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [projectResponse, incomingResponse, outgoingResponse] = await Promise.all([
        api.get("/projects", { params: { mine: true } }),
        api.get("/requests", { params: { type: "incoming" } }),
        api.get("/requests", { params: { type: "outgoing" } }),
      ]);

      setProjects(projectResponse.data.projects || []);
      setIncomingRequests(incomingResponse.data.requests || []);
      setOutgoingRequests(outgoingResponse.data.requests || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRequestAction = async (requestId, action) => {
    try {
      await api.put(`/requests/${action}`, { requestId });
      setMessage(`Request ${action === "accept" ? "accepted" : "rejected"}.`);
      
      // Auto clear message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update request.");
    }
  };

  const hackathons = projects.filter((p) => p.isHackathon);
  const regularProjects = projects.filter((p) => !p.isHackathon);

  const renderProjectItem = (project) => {
    const readiness = getProjectReadiness(project);
    const openSpots = getProjectOpenSpots(project);

    return (
      <div key={project._id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-all duration-300 hover:border-brand-500/20 dark:border-slate-800/60 dark:bg-slate-950/20">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              project.status === "open"
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-amber-400 bg-amber-500/10 border-amber-500/20"
            }`}>
              {project.status || "open"}
            </span>
            {project.isHackathon && project.hackathonName && (
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border text-violet-400 bg-violet-500/10 border-violet-500/20">
                {project.hackathonName}
              </span>
            )}
          </div>
          
          <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight font-display">{project.title}</h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-300">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="rounded-lg bg-brand-50 px-2 py-1 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
              Readiness {readiness.score}%
            </span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {openSpots} open spots
            </span>
          </div>
        </div>

        <Link to={`/projects/${project._id}`} className="btn-secondary py-2 px-3.5 text-xs font-bold rounded-lg shrink-0">
          View
        </Link>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header: Command Portal Hero */}
      <PageHeader
        badge="Dashboard"
        badgeIcon={LayoutDashboard}
        title="Your workspace"
        description="Manage hackathons, projects, review applications, track invites."
        action={
          user?.role === "admin" ? (
            <Link to="/admin" className="btn-secondary !border-white/30 !bg-white/15 !text-white">Admin</Link>
          ) : null
        }
      >
        {message && (
          <div className="relative mt-4 flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <BadgeCheck className="h-4 w-4" /> {message}
          </div>
        )}
      </PageHeader>

      {/* 2. Statistical Dossier Cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Hackathons" value={hackathons.length} />
        <StatCard label="Projects" value={regularProjects.length} />
        <StatCard label="Pending applications" value={incomingRequests.filter((r) => r.status === "pending").length} accent="coral" />
        <StatCard label="Sent requests" value={outgoingRequests.length} accent="mint" />
      </section>

      {/* 3. Core Panels */}
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        
        {/* Left Panel: Hackathons + Projects */}
        <div className="space-y-6">

          {/* Hackathons Panel */}
          <div className="surface flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800/60">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-500 dark:text-violet-400">Hackathons</p>
                  <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white md:text-2xl">My Hackathons</h2>
                </div>
                <Link to="/hackathons/new" className="btn-primary py-2.5 px-4 text-xs font-extrabold flex items-center gap-1.5 rounded-xl shadow-glow">
                  <Trophy className="h-3.5 w-3.5" />
                  New hackathon
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent align-[-0.125em]" />
                    <p className="mt-3 text-xs text-slate-500">Loading…</p>
                  </div>
                ) : null}

                {!loading && hackathons.length === 0 ? (
                  <EmptyState
                    title="No hackathons yet"
                    description="Post your first hackathon team call to start recruiting."
                    action={
                      <Link to="/hackathons/new" className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold">
                        <Trophy className="h-3.5 w-3.5 mr-1.5" /> Post hackathon
                      </Link>
                    }
                  />
                ) : null}

                {!loading ? hackathons.map((p) => renderProjectItem(p)) : null}
              </div>
            </div>
          </div>

          {/* Projects Panel */}
          <div className="surface flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800/60">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Projects</p>
                  <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white md:text-2xl">My Projects</h2>
                </div>
                <Link to="/projects/new" className="btn-primary py-2.5 px-4 text-xs font-extrabold flex items-center gap-1.5 rounded-xl shadow-glow">
                  <Rocket className="h-3.5 w-3.5" />
                  New project
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent align-[-0.125em]" />
                    <p className="mt-3 text-xs text-slate-500">Loading…</p>
                  </div>
                ) : null}

                {!loading && regularProjects.length === 0 ? (
                  <EmptyState
                    title="No projects yet"
                    description="Post your first project to start recruiting teammates."
                    action={
                      <Link to="/projects/new" className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold">
                        Post project
                      </Link>
                    }
                  />
                ) : null}

                {!loading ? regularProjects.map((p) => renderProjectItem(p)) : null}
              </div>
            </div>
          </div>
        </div>
        {/* Pending approvals application panel */}
        <div className="surface sticky top-28 self-start flex flex-col justify-between">
          <div>
            <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Incoming</p>
              <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white md:text-2xl">Pending requests</h2>
            </div>

            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <EmptyState
                  title="No pending requests"
                  description="Incoming squad requests will appear here as soon as builders submit applications."
                />
              ) : null}

              {incomingRequests.map((request) => (
                <div key={request._id} className="space-y-3 rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/20">
                  {(() => {
                    const inviteEligibility =
                      request.requestType === "invite"
                        ? getProjectEligibility({ project: request.projectId, user })
                        : { allowed: true, message: "" };
                    const projectFull = isProjectFull(request.projectId);

                    return (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-extrabold text-brand-400">
                              {request.sender?.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-300 leading-snug mt-1">
                              {request.requestType === "invite"
                                ? `invited you to join `
                                : `wants to join `}
                              <span className="font-bold text-slate-800 dark:text-white">"{request.projectId?.title}"</span>
                            </p>
                          </div>
                          
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                            {request.status}
                          </span>
                        </div>

                        {request.status === "pending" ? (
                          <div className="flex gap-2.5 pt-2">
                            <button
                              type="button"
                              onClick={() => handleRequestAction(request._id, "accept")}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-extrabold border transition-all ${
                                inviteEligibility.allowed && !projectFull
                                  ? "btn-primary shadow-glow hover:border-brand-500"
                                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500"
                              }`}
                              disabled={!inviteEligibility.allowed || projectFull}
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>{projectFull ? "Team full" : inviteEligibility.allowed ? "Accept" : "Ineligible"}</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleRequestAction(request._id, "reject")}
                              className="btn-secondary py-2 px-3 rounded-lg text-xs font-bold flex-1 flex items-center justify-center gap-1"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : null}

                        {(!inviteEligibility.allowed || projectFull) && (
                          <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10 flex items-start gap-1.5 text-[11px] font-semibold text-red-400">
                            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                            <span>{projectFull ? "This project is already full. Increase capacity or clear a spot before accepting." : inviteEligibility.message}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
