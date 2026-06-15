import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Plus, ArrowRight, Loader2 } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProjectCard from "../components/shared/ProjectCard";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import ReportModal from "../components/shared/ReportModal";

export default function LikesPage() {
  const { user, updateLocalUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [requests, setRequests] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);

  const handleReportSubmit = async (reason) => {
    if (!reportTarget) return;
    await api.post("/reports", {
      projectId: reportTarget._id,
      reason,
    });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [projectsRes, requestsRes] = await Promise.all([
          api.get("/projects", { params: { liked: true } }),
          api.get("/requests", { params: { type: "outgoing" } }),
        ]);
        setProjects(projectsRes.data.projects || []);
        setRequests(requestsRes.data.requests || []);
      } catch (error) {
        setFeedback(error.response?.data?.message || "Unable to load saved projects.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRequestJoin = async (project) => {
    const tempId = `temp-${Date.now()}`;
    setRequests((prev) => [{ _id: tempId, projectId: project._id, status: "pending", sender: { _id: user?._id } }, ...prev]);
    try {
      const { data } = await api.post("/requests/send", {
        projectId: project._id,
        receiver: project.teamLead?._id || project.createdBy?._id,
      });
      setRequests((prev) => prev.map((r) => (r._id === tempId ? data.request : r)));
      setFeedback(`Request sent for "${project.title}".`);
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      setRequests((prev) => prev.filter((r) => r._id !== tempId));
      setFeedback(error.response?.data?.message || "Unable to send request.");
    }
  };

  const handleBookmark = async (projectId) => {
    try {
      const { data } = await api.put(`/users/bookmarks/${projectId}`);
      updateLocalUser({ ...user, bookmarks: data.bookmarks });
      setProjects((curr) => curr.filter((p) => p._id !== projectId));
      setFeedback("Removed from saved.");
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to update saved list.");
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Delete this project permanently?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((curr) => curr.filter((p) => p._id !== projectId));
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to delete.");
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        variant="accent"
        badge="Saved"
        badgeIcon={Bookmark}
        title="Saved projects"
        description="Projects you bookmarked — come back when you're ready to apply."
        stats={[{ label: "Saved", value: projects.length }]}
        action={
          <Link to="/projects/new" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-accent-700 shadow-md hover:bg-accent-50">
            <Plus className="h-4 w-4" /> New project
          </Link>
        }
      >
        {feedback && (
          <div className="relative mt-4 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            {feedback}
          </div>
        )}
      </PageHeader>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      )}

      {!loading && projects.length === 0 && (
        <EmptyState
          title="Nothing saved yet"
          description="Browse projects on Discover and tap Save on ones you like."
          action={
            <Link to="/feed" className="btn-primary">
              Browse projects <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      )}

      {!loading && (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project) => {
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
          </div>

          <ReportModal
            isOpen={!!reportTarget}
            onClose={() => setReportTarget(null)}
            onSubmit={handleReportSubmit}
            projectTitle={reportTarget?.title || ""}
          />
        </>
      )}
    </div>
  );
}
