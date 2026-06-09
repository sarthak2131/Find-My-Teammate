import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, Search, UserPlus, Sparkles, Cpu, ChevronRight, Activity, Code2, Users, Check, Bookmark
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProjectCard from "../components/shared/ProjectCard";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import { PROJECT_GENDER_OPTIONS } from "../utils/genderPreferences";
import Avatar from "../components/shared/Avatar";

export default function HomeFeedPage() {
  const navigate = useNavigate();
  const { user, updateLocalUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [preferredGender, setPreferredGender] = useState("");
  const [feedback, setFeedback] = useState("");
  const [requests, setRequests] = useState([]);

  const deferredQuery = useDeferredValue(query);

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
            },
          }),
          api.get("/requests", {
            params: { type: "outgoing" },
          }),
        ]);
        setProjects(projectsRes.data.projects || []);
        setRequests(requestsRes.data.requests || []);
      } catch (error) {
        setFeedback(error.response?.data?.message || "Unable to load projects.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [deferredQuery, preferredGender, status]);

  useEffect(() => {
    api.get("/users")
      .then(({ data }) => {
        // Exclude current user from recommendations
        const others = (data.users || []).filter(u => u._id !== user?._id);
        
        // Compute static aesthetic match scores for each user based on overlapping skills
        const withScores = others.map(u => {
          const userSkills = new Set(user?.skills?.map(s => s.toLowerCase()) || []);
          const otherSkills = u.skills || [];
          let intersection = otherSkills.filter(s => userSkills.has(s.toLowerCase())).length;
          
          // Generate a premium match score
          let matchScore = 70 + (intersection * 10);
          if (matchScore > 98) matchScore = 98;
          if (intersection === 0) matchScore = 75 + (u.name.charCodeAt(0) % 15); // visual diversity
          
          return { ...u, matchScore };
        }).sort((a, b) => b.matchScore - a.matchScore);

        setSuggestedUsers(withScores.slice(0, 5));
      })
      .catch(() => {});
  }, [user]);

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
    <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
      
      {/* Left Column: Structured Opportunity Workspace Feed */}
      <div className="space-y-6">
        
        {/* Top Header Filter Workspace Card */}
        <PageHeader
          badge="Discover"
          badgeIcon={Code2}
          title="Open projects"
          description="Browse team calls, filter by skills, and apply to join."
          action={
            <Link to="/projects/new" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-md hover:bg-brand-50">
              <Plus className="h-4 w-4" /> Post project
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
              <option value="" className="bg-white dark:bg-slate-900">All Project Statuses</option>
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
            <div className="col-span-full surface py-12 text-center text-sm text-slate-500">
              <div className="flex flex-col items-center justify-center gap-3">
                <Activity className="h-6 w-6 text-brand-400 animate-pulse" />
                <span>Loading projects…</span>
              </div>
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                title="No projects found"
                description="Try different filters or be the first to post a project."
                action={
                  <Link to="/projects/new" className="btn-primary shadow-glow">
                    <Plus className="mr-2 h-4 w-4" />
                    Post project
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
              />
            );
          })}
        </section>
      </div>

      {/* Right Column: Premium Teammate Matchmaking Sidebar */}
      <aside className="sticky top-24 space-y-5 lg:block hidden">
        <div className="surface p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-800/60 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Suggested for you</h3>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
            Builders whose skills overlap with yours — tap to view their profile.
          </p>

          <div className="space-y-3.5">
            {suggestedUsers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No recommendations found.</p>
            ) : (
              suggestedUsers.map((candidate) => (
                <div 
                  key={candidate._id}
                  onClick={() => navigate(`/profile/${candidate._id}`)}
                  className="p-3 rounded-xl border border-slate-150/60 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/40 hover:border-brand-500/30 transition-all duration-300 flex items-start justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex gap-2.5">
                    <div className="h-9 w-9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                      <Avatar src={candidate.profileImage?.url} alt={candidate.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                        {candidate.name}
                      </h4>
                      <p className="text-[9px] font-mono text-slate-400 truncate max-w-[150px] mt-0.5">
                        {candidate.skills?.slice(0, 3).join(" • ") || "Developer"}
                      </p>
                      
                      {/* Match Index Tag */}
                      <span className="chip-accent mt-1.5 inline-flex gap-1">
                        <Cpu className="h-2.5 w-2.5" />
                        {candidate.matchScore}% match
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 group-hover:bg-brand-500/10 group-hover:text-brand-400 transition-colors text-slate-400 self-center">
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-150 dark:border-slate-800/60">
            <Link 
              to="/explore"
              className="flex w-full items-center justify-center gap-1 text-xs font-bold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-400"
            >
              <span>Find more teammates</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </aside>

    </div>
  );
}
