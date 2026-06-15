import { useEffect, useState } from "react";
import {
  ArrowLeft, Bookmark, Calendar, Check, MessageCircle, Trash2, UserPlus, Users, X, Pencil,
  Code2, Crown, Clock, Zap, Loader2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ReportModal from "../components/shared/ReportModal";
import { formatDate, formatDateTime } from "../utils/formatters";
import Avatar from "../components/shared/Avatar";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import { getProjectEligibility, getProjectGenderLabel } from "../utils/genderPreferences";
import {
  getProjectCapacity,
  getProjectFitInsights,
  getProjectOpenSpots,
  getProjectReadiness,
  getProjectTimelineInsight,
  isProjectFull,
} from "../utils/projectInsights";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateLocalUser } = useAuth();
  const [project, setProject] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  const handleReportSubmit = async (reason) => {
    await api.post("/reports", {
      projectId: project._id,
      reason,
    });
  };

  const loadProject = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data.project);
      setRequests(data.requests || []);
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to load project.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProject(); }, [id]);

  const isOwner = project?.createdBy?._id === user?._id;
  const isAdmin = user?.role === "admin";
  const isMember = project?.members?.some((m) => m._id === user?._id);
  const canMessageLead = project?.createdBy?._id && project.createdBy._id !== user?._id;
  const eligibility = getProjectEligibility({ project, user });
  const existingRequest = requests.find((r) => r.sender?._id === user?._id || r.receiver?._id === user?._id);
  const isBookmarked = user?.bookmarks?.includes(project?._id);
  const canRespondToInvite =
    existingRequest?.requestType === "invite" &&
    existingRequest?.receiver?._id === user?._id &&
    existingRequest?.status === "pending";
  const canManageRequests = isOwner || isAdmin;
  const canManageMembers = isOwner || isAdmin;
  const capacity = getProjectCapacity(project);
  const openSpots = getProjectOpenSpots(project);
  const projectIsFull = isProjectFull(project);
  const fitInsights = getProjectFitInsights(project, user);
  const readiness = getProjectReadiness(project);
  const timeline = getProjectTimelineInsight(project);
  const gitHubLinkMatch = project?.description?.match(/https:\/\/github\.com\/[^\s]+/);
  const gitHubUrl = gitHubLinkMatch ? gitHubLinkMatch[0] : null;

  const handleRequestJoin = async () => {
    try {
      await api.post("/requests/send", { projectId: project._id, receiver: project.teamLead?._id || project.createdBy?._id });
      setFeedback("Request sent!");
      loadProject();
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to send request.");
    }
  };

  const handleBookmark = async () => {
    try {
      const { data } = await api.put(`/users/bookmarks/${project._id}`);
      updateLocalUser({ ...user, bookmarks: data.bookmarks });
      setFeedback(data.message);
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to update bookmark.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this project permanently?")) return;
    try {
      await api.delete(`/projects/${project._id}`);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to delete.");
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await api.put(`/requests/${action}`, { requestId });
      setFeedback(`Request ${action === "accept" ? "accepted" : "rejected"}.`);
      loadProject();
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to update request.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this teammate?")) return;
    try {
      const { data } = await api.delete(`/projects/${project._id}/members/${memberId}`);
      setProject(data.project);
      setFeedback(data.message);
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to remove member.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="text-sm text-slate-500">Loading project…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState title="Project not found" description={feedback} action={<Link to="/feed" className="btn-primary">Back to Discover</Link>} />
    );
  }

  const isVideoPoster = project.posterUrl && /\.(mp4|webm|ogg|mov)($|\?)/i.test(project.posterUrl);

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/feed" className="btn-secondary text-sm"><ArrowLeft className="h-4 w-4" /> Back</Link>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleBookmark} className={`btn-secondary text-sm ${isBookmarked ? "!border-brand-400 !bg-brand-50 !text-brand-700" : ""}`}>
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-brand-500" : ""}`} /> {isBookmarked ? "Saved" : "Save"}
          </button>
          {!isOwner && (
            <button type="button" onClick={() => setShowReportModal(true)} className="btn-secondary text-sm !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-950/20">
              Report
            </button>
          )}
          {(isOwner || isAdmin) && (
            <>
              <Link to={`/projects/${project._id}/edit`} className="btn-secondary text-sm"><Pencil className="h-4 w-4" /> Edit</Link>
              <button type="button" onClick={handleDelete} className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      <PageHeader
        badge={project.isShowcase ? "Showcase" : project.status}
        badgeIcon={Code2}
        title={project.title}
        description={project.description}
        stats={project.isShowcase ? [
          { label: "Type", value: "Showcase Project" },
          { label: "Skills", value: (project.requiredSkills || []).length },
        ] : [
          { label: "Deadline", value: formatDate(project.deadline) || "—" },
          { label: "Members", value: `${project.members?.length || 0}/${capacity}` },
          { label: "Skills", value: (project.requiredSkills || []).length },
        ]}
      >
        {project.preferredGender && project.preferredGender !== "any" && (
          <span className="relative mt-3 inline-block chip-accent">{getProjectGenderLabel(project.preferredGender)}</span>
        )}
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {project.preferredTeammateNote && (
            <div className="surface-muted flex gap-2 border-accent-200 bg-accent-50/50 dark:border-accent-900 dark:bg-accent-950/20">
              <Zap className="h-5 w-5 shrink-0 text-accent-500" />
              <p className="text-sm"><strong className="text-accent-700 dark:text-accent-300">Looking for:</strong> {project.preferredTeammateNote}</p>
            </div>
          )}

          {(project.requiredSkills || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.map((s) => <span key={s} className="chip">{s}</span>)}
            </div>
                    {!project.isShowcase && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="surface-muted border-slate-200 bg-slate-50/70 dark:border-slate-700/50 dark:bg-slate-900/20">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Capacity</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-800 dark:text-white">{openSpots} spots</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{project.members?.length || 0}/{capacity} filled</p>
                </div>
                <div className="surface-muted border-accent-100 bg-accent-50/60 dark:border-accent-900/30 dark:bg-accent-950/10">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-accent-600 dark:text-accent-300">Project readiness</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-800 dark:text-white">{readiness.score}%</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{timeline.label}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                    style={{ width: `${Math.max(10, Math.round(((project.members?.length || 0) / capacity) * 100))}%` }}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/30 dark:bg-emerald-950/10">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Skills you match</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {fitInsights.matchedSkills.length > 0 ? fitInsights.matchedSkills.map((skill) => (
                        <span key={skill} className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-slate-900 dark:text-emerald-300">
                          {skill}
                        </span>
                      )) : <span className="text-sm text-slate-500 dark:text-slate-400">Add more matching skills to improve your fit.</span>}
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-950/10">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Skill gaps to cover</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {fitInsights.missingSkills.length > 0 ? fitInsights.missingSkills.slice(0, 4).map((skill) => (
                        <span key={skill} className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-slate-900 dark:text-amber-300">
                          {skill}
                        </span>
                      )) : <span className="text-sm text-slate-500 dark:text-slate-400">You already cover all listed skills.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-3">
            {project.isShowcase ? (
              <>
                {gitHubUrl && (
                  <a href={gitHubUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2">
                    <Github className="h-4 w-4" /> View GitHub Repository
                  </a>
                )}
                {canMessageLead && (
                  <Link to={`/chat?user=${project.createdBy._id}`} className="btn-secondary"><MessageCircle className="h-4 w-4" /> Message creator</Link>
                )}
              </>
            ) : (
              <>
                {(isOwner || isMember) ? (
                  <Link to="/dashboard" className="btn-primary">Manage in dashboard</Link>
                ) : canRespondToInvite ? (
                  <>
                    <button type="button" onClick={() => handleRequestAction(existingRequest._id, "accept")} disabled={!eligibility.allowed || projectIsFull} className="btn-primary !from-success-600 !to-success-500">
                      <Check className="h-4 w-4" /> {projectIsFull ? "Team full" : "Accept invite"}
                    </button>
                    <button type="button" onClick={() => handleRequestAction(existingRequest._id, "reject")} className="btn-secondary">Decline</button>
                  </>
                ) : existingRequest ? (
                  <span className="chip-accent">Status: {existingRequest.status}</span>
                ) : (
                  <button type="button" onClick={handleRequestJoin} disabled={!eligibility.allowed || projectIsFull} className="btn-primary">
                    <UserPlus className="h-4 w-4" /> {projectIsFull ? "Team full" : eligibility.allowed ? "Request to join" : "Not eligible"}
                  </button>
                )}
                {canMessageLead && (
                  <Link to={`/chat?user=${project.createdBy._id}`} className="btn-secondary"><MessageCircle className="h-4 w-4" /> Message lead</Link>
                )}
              </>
            )}
          </div>

          {feedback && <div className="rounded-xl border-2 border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">{feedback}</div>}
          {!project.isShowcase && (
            <>
              {projectIsFull && !isOwner && !isMember && (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  This team is currently full. You can still bookmark it and track whether a spot opens up.
                </div>
              )}
              {!eligibility.allowed && !isOwner && !isMember && (
                <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700">{eligibility.message}</div>
              )}
            </>
          )}  )}
        </div>

        {project.posterUrl && (
          <div className="surface overflow-hidden p-0">
            {isVideoPoster ? <video src={project.posterUrl} controls className="w-full" /> : <img src={project.posterUrl} alt="" className="w-full object-contain" />}
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="surface">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-accent-600"><Crown className="h-4 w-4" /> Team lead</p>
          <Link to={`/profile/${project.createdBy?._id}`} className="flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-xl ring-2 ring-accent-300">
              <Avatar src={project.createdBy?.profileImage?.url} alt={project.createdBy?.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{project.createdBy?.name}</p>
              <p className="text-sm text-slate-500 line-clamp-2">{project.createdBy?.bio || "No bio"}</p>
            </div>
          </Link>
        </div>

        <div className="surface">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-brand-600">
            <Users className="h-4 w-4" /> Members ({project.members?.length || 0})
          </p>
          <div className="space-y-2">
            {(project.members || []).map((member) => (
              <div key={member._id} className="surface-muted flex items-center justify-between gap-2 p-3">
                <Link to={`/profile/${member._id}`} className="flex items-center gap-3 min-w-0">
                  <Avatar src={member.profileImage?.url} alt={member.name} className="h-9 w-9 rounded-lg object-cover" />
                  <span className="truncate text-sm font-semibold">{member.name}</span>
                </Link>
                {canManageMembers && member._id !== project.createdBy?._id && (
                  <button type="button" onClick={() => handleRemoveMember(member._id)} className="text-xs font-bold text-red-600">Remove</button>
                )}
              </div>
            ))}
            {(!project.members || project.members.length === 0) && <p className="text-sm text-slate-500">No members yet</p>}
          </div>
        </div>
      </div>

      {(canManageRequests || existingRequest) && (
        <div className="surface">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {canManageRequests ? "Join requests" : "Your request"}
          </h2>
          {requests.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No requests yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {requests.map((request) => (
                <div key={request._id} className="surface-muted flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={request.sender?.profileImage?.url} alt={request.sender?.name} className="h-10 w-10 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{request.sender?.name}</p>
                      <p className="text-xs text-slate-500">{request.requestType} · {request.status}</p>
                    </div>
                  </div>
                  {canManageRequests && request.status === "pending" && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleRequestAction(request._id, "accept")} disabled={projectIsFull} className="btn-primary py-1.5 text-xs disabled:opacity-50">
                        {projectIsFull ? "Full" : "Accept"}
                      </button>
                      <button type="button" onClick={() => handleRequestAction(request._id, "reject")} className="btn-secondary py-1.5 text-xs">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        projectTitle={project?.title || ""}
      />
    </div>
  );
}
