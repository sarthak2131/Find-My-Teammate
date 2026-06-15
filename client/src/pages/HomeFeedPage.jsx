import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { 
  Plus, Search, UserPlus, Sparkles, Cpu, ChevronRight, Activity, Code2, Users, Check, Bookmark
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProjectCard from "../components/shared/ProjectCard";
import ProjectCardSkeleton from "../components/shared/ProjectCardSkeleton";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import { PROJECT_GENDER_OPTIONS } from "../utils/genderPreferences";
import { getProjectFitInsights, getProjectOpenSpots } from "../utils/projectInsights";
import Avatar from "../components/shared/Avatar";
import ReportModal from "../components/shared/ReportModal";

export default function HomeFeedPage() {
  const navigate = useNavigate();
  const { user, updateLocalUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialSearch);
  const [status, setStatus] = useState("");
  const [preferredGender, setPreferredGender] = useState("");
  const [feedback, setFeedback] = useState("");
  const [requests, setRequests] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);

  const deferredQuery = useDeferredValue(query);

  const handleReportSubmit = async (reason) => {
    if (!reportTarget) return;
    await api.post("/reports", {
      projectId: reportTarget._id,
      reason,
    });
  };

  useEffect(() => {
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const [projectsRes, requestsRes] = await Promise.all([
          api.get("/projects", {
            params: {
              search: deferredQuery || undefined,
              status: status || undefined,
              preferredGender: preferredGender || undefined,
              excludeOwner: true,
              excludeShowcase: "true",
              isHackathon: "true",
            },
          }),
          api.get("/requests", {
            params: { type: "outgoing" },
          }),
        ]);
        const filtered = (projectsRes.data.projects || []).filter(
          (project) =>
            !project.isShowcase &&
            !project.description?.includes("GitHub: https://github.com/") &&
            (project.createdBy?._id || project.createdBy) !== user?._id
        );
        const rankedProjects = filtered
          .slice()
          .sort((a, b) => {
            const scoreDelta =
              getProjectFitInsights(b, user).fitScore - getProjectFitInsights(a, user).fitScore;

            if (scoreDelta !== 0) {
              return scoreDelta;
            }

            return getProjectOpenSpots(b) - getProjectOpenSpots(a);
          });

        setProjects(rankedProjects);
        setRequests(requestsRes.data.requests || []);
      } catch (error) {
        setFeedback(error.response?.data?.message || "Unable to load projects.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [deferredQuery, preferredGender, status, user]);



  const handleRequestJoin = async (project) => {
    const tempRequestId = `temp-${Date.now()}`;
    const tempRequest = {
      _id: tempRequestId,
      projectId: project._id,
      status: "pending",
      sender: { _id: user?._id },
    };

    // Optimistically update requests in frontend state
    setRequests((prev) => [tempRequest, ...prev]);

    try {
      const { data } = await api.post("/requests/send", {
        projectId: project._id,
        receiver: project.teamLead?._id || project.createdBy?._id,
      });
      // Replace the temp request with the real populated request from backend
      setRequests((prev) =>
        prev.map((r) => (r._id === tempRequestId ? data.request : r))
      );
      setFeedback(`Request sent for ${project.title}.`);
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      // Revert optimistic update
      setRequests((prev) => prev.filter((r) => r._id !== tempRequestId));
      setFeedback(error.response?.data?.message || "Unable to send request.");
    }
  };

  const handleBookmark = async (projectId) => {
    try {
      const { data } = await api.put(`/users/bookmarks/${projectId}`);
      updateLocalUser({
        ...user,
        bookmarks: data.bookmarks,
      });
      setFeedback(data.message);
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to update bookmark.");
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Delete this project permanently?")) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((currentProjects) => currentProjects.filter((project) => project._id !== projectId));
      setFeedback("Project deleted.");
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to delete project.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      
      {/* Top Header Filter Workspace Card */}
      <PageHeader
        badge="Discover"
        badgeIcon={Code2}
        title="Active hackathons"
        description="Browse active hackathon team recruitment calls, then apply to join."
        action={
          <Link to="/hackathons/new" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-md hover:bg-brand-50">
            <Plus className="h-4 w-4" /> Post team call
          </Link>
        }
      />
      <section className="surface p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10 bg-slate-50/50 dark:bg-slate-950/40"
              value={query}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => setQuery(nextValue));
              }}
              placeholder="Search stacks, titles or skills..."
            />
          </div>

          <select className="input bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="" className="bg-white dark:bg-slate-900">All Hackathon Statuses</option>
            <option value="open" className="bg-white dark:bg-slate-900">🟢 Recruitment Open</option>
            <option value="in-progress" className="bg-white dark:bg-slate-900">🟡 Coding Phase</option>
            <option value="closed" className="bg-white dark:bg-slate-900">🔴 Squad Full</option>
          </select>

          <select
            className="input bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300"
            value={preferredGender}
            onChange={(event) => setPreferredGender(event.target.value)}
          >
            <option value="" className="bg-white dark:bg-slate-900">All Gender Prefs</option>
            {PROJECT_GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {feedback && (
          <div className="mt-4 rounded-xl bg-brand-500/10 border border-brand-500/25 px-4 py-2.5 text-xs font-semibold text-brand-400">
            {feedback}
          </div>
        )}
      </section>

      {/* Opportunity Card List */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading && (
          <>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </>
        )}

        {!loading && projects.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              title="No active hackathons found"
              description="Try different filters or be the first to host a hackathon team call."
              action={
                <Link to="/hackathons/new" className="btn-primary shadow-glow">
                  <Plus className="mr-2 h-4 w-4" />
                  Post team call
                </Link>
              }
            />
          </div>
        )}

        {!loading && projects.map((project) => {
          const projectRequest = requests.find(
            (r) => (r.projectId?._id || r.projectId) === project._id
          );
          return (
            <ProjectCard
              key={project._id}
              project={project}
              currentUser={user}
              onRequestJoin={handleRequestJoin}
              onBookmark={handleBookmark}
              onDelete={handleDelete}
              projectRequest={projectRequest}
              onReport={setReportTarget}
            />
          );
        })}
      </section>

      <ReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmit={handleReportSubmit}
        projectTitle={reportTarget?.title || ""}
      />

    </div>
  );
}
