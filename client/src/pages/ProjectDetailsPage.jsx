import { useEffect, useState } from "react";
import {
  ArrowLeft, Bookmark, Calendar, Check, MessageCircle, Trash2, UserPlus, Users, X, Pencil,
  Code2, Crown, Clock, Zap, Loader2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatDateTime } from "../utils/formatters";
import Avatar from "../components/shared/Avatar";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import { getProjectEligibility, getProjectGenderLabel } from "../utils/genderPreferences";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateLocalUser } = useAuth();
  const [project, setProject] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

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
        badge={project.status}
        badgeIcon={Code2}
        title={project.title}
        description={project.description}
        stats={[
          { label: "Deadline", value: formatDate(project.deadline) || "—" },
          { label: "Members", value: project.members?.length || 0 },
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
          )}

          <div className="flex flex-wrap gap-3">
            {(isOwner || isMember) ? (
              <Link to="/dashboard" className="btn-primary">Manage in dashboard</Link>
            ) : canRespondToInvite ? (
              <>
                <button type="button" onClick={() => handleRequestAction(existingRequest._id, "accept")} disabled={!eligibility.allowed} className="btn-primary !from-success-600 !to-success-500">
                  <Check className="h-4 w-4" /> Accept invite
                </button>
                <button type="button" onClick={() => handleRequestAction(existingRequest._id, "reject")} className="btn-secondary">Decline</button>
              </>
            ) : existingRequest ? (
              <span className="chip-accent">Status: {existingRequest.status}</span>
            ) : (
              <button type="button" onClick={handleRequestJoin} disabled={!eligibility.allowed} className="btn-primary">
                <UserPlus className="h-4 w-4" /> {eligibility.allowed ? "Request to join" : "Not eligible"}
              </button>
            )}
            {canMessageLead && (
              <Link to={`/chat?user=${project.createdBy._id}`} className="btn-secondary"><MessageCircle className="h-4 w-4" /> Message lead</Link>
            )}
          </div>

          {feedback && <div className="rounded-xl border-2 border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">{feedback}</div>}
          {!eligibility.allowed && !isOwner && !isMember && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700">{eligibility.message}</div>
          )}
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
                      <button type="button" onClick={() => handleRequestAction(request._id, "accept")} className="btn-primary py-1.5 text-xs">Accept</button>
                      <button type="button" onClick={() => handleRequestAction(request._id, "reject")} className="btn-secondary py-1.5 text-xs">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
