import { useEffect, useState, useRef } from "react";
import {
  Github,
  Link as LinkIcon,
  Save,
  UploadCloud,
  Code2,
  Star,
  Zap,
  MapPin,
  Camera,
  CheckCircle,
  MessageSquare,
  User,
  Loader2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProjectCard from "../components/shared/ProjectCard";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import Avatar from "../components/shared/Avatar";
import { defaultAvatar } from "../utils/defaultAvatar";
import { USER_GENDER_OPTIONS, getUserGenderLabel } from "../utils/genderPreferences";

export default function ProfilePage() {
  const { id } = useParams();
  const { user, updateLocalUser } = useAuth();
  const profileId = id || user?._id;
  const isOwnProfile = !id || id === user?._id;

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [isAvatarDragging, setIsAvatarDragging] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    githubLink: "",
    availability: "",
    skills: "",
    interests: "",
    profileImageUrl: "",
    profileImage: null,
    gender: "prefer-not-to-say",
  });

  const handleAvatarFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Image must be under 10MB.");
      return;
    }
    setMessage("");
    setForm((prev) => ({ ...prev, profileImage: file }));
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, requestsRes] = await Promise.all([
          api.get(`/users/${profileId}`),
          api.get("/requests", { params: { type: "outgoing" } }),
        ]);
        setProfile(profileRes.data.user);
        setProjects(profileRes.data.projects || []);
        setRequests(requestsRes.data.requests || []);
        setForm({
          name: profileRes.data.user.name || "",
          bio: profileRes.data.user.bio || "",
          githubLink: profileRes.data.user.githubLink || "",
          availability: profileRes.data.user.availability || "",
          gender: profileRes.data.user.gender || "prefer-not-to-say",
          skills: (profileRes.data.user.skills || []).join(", "),
          interests: (profileRes.data.user.interests || []).join(", "),
          profileImageUrl:
            profileRes.data.user.profileImage?.url &&
            profileRes.data.user.profileImage.url !== defaultAvatar
              ? profileRes.data.user.profileImage.url
              : "",
          profileImage: null,
        });
      } catch (error) {
        setMessage(error.response?.data?.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };
    if (profileId) loadProfile();
  }, [profileId]);

  const handleRequestJoin = async (project) => {
    const tempRequestId = `temp-${Date.now()}`;
    setRequests((prev) => [
      { _id: tempRequestId, projectId: project._id, status: "pending", sender: { _id: user?._id } },
      ...prev,
    ]);
    try {
      const { data } = await api.post("/requests/send", {
        projectId: project._id,
        receiver: project.teamLead?._id || project.createdBy?._id,
      });
      setRequests((prev) => prev.map((r) => (r._id === tempRequestId ? data.request : r)));
      setMessage(`Request sent for ${project.title}.`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setRequests((prev) => prev.filter((r) => r._id !== tempRequestId));
      setMessage(error.response?.data?.message || "Unable to send request.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("bio", form.bio);
      formData.append("githubLink", form.githubLink);
      formData.append("availability", form.availability);
      formData.append("gender", form.gender);
      formData.append("skills", form.skills);
      formData.append("interests", form.interests);
      formData.append("profileImageUrl", form.profileImageUrl);
      if (form.profileImage) formData.append("profileImage", form.profileImage);

      const { data } = await api.put("/users/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateLocalUser(data.user);
      setProfile(data.user);
      setAvatarPreview("");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      setMessage("Profile saved successfully!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="text-sm font-medium text-slate-500">Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="Profile not found"
        description={message || "This profile could not be loaded."}
      />
    );
  }

  const skillsList = profile.skills || [];
  const interestsList = profile.interests || [];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        badge={isOwnProfile ? "Your profile" : "Builder profile"}
        badgeIcon={User}
        title={profile.name}
        description={profile.bio || "No bio added yet."}
        stats={[
          { label: "Projects", value: projects.length },
          { label: "Skills", value: skillsList.length },
          { label: "Interests", value: interestsList.length },
        ]}
        action={
          <div className="flex flex-wrap gap-2">
            {profile.githubLink && (
              <a
                href={profile.githubLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur-sm hover:bg-white/30"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
            )}
            {!isOwnProfile && (
              <Link
                to={`/chat?user=${profile._id}`}
                className="btn-primary bg-white !from-white !to-white !text-brand-700 !shadow-none hover:!text-accent-600"
              >
                <MessageSquare className="h-4 w-4" /> Message
              </Link>
            )}
          </div>
        }
      />

      {/* Profile card */}
      <div className="surface flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div className="h-28 w-28 overflow-hidden rounded-2xl ring-4 ring-brand-200 dark:ring-brand-700">
            <Avatar src={profile.profileImage?.url} alt={profile.name} className="h-full w-full object-cover" />
          </div>
          {profile.availability && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-success-500 px-3 py-0.5 text-[10px] font-bold text-white">
              Available
            </span>
          )}
        </div>
        <div className="flex-1 space-y-3">
          {profile.availability && (
            <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <MapPin className="h-4 w-4 text-brand-500" />
              {profile.availability}
            </p>
          )}
          {profile.gender && profile.gender !== "prefer-not-to-say" && (
            <span className="chip">{getUserGenderLabel(profile.gender)}</span>
          )}
          {skillsList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill) => (
                <span key={skill} className="chip">
                  {skill}
                </span>
              ))}
            </div>
          )}
          {interestsList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {interestsList.map((interest) => (
                <span key={interest} className="chip-accent">
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <div className="surface">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Edit profile
          </h2>
          <p className="mt-1 text-sm text-slate-500">Update how teammates see you</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">
                  Display name
                </span>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">
                  Availability
                </span>
                <input
                  className="input"
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  placeholder="Open to collaborate"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">Gender</span>
                <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  {USER_GENDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">GitHub</span>
                <input
                  className="input"
                  value={form.githubLink}
                  onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">Bio</span>
              <textarea
                className="input min-h-28 resize-none"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell teammates about yourself…"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">
                  Skills (comma separated)
                </span>
                <input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">Interests</span>
                <input className="input" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
              </label>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsAvatarDragging(true);
              }}
              onDragLeave={() => setIsAvatarDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsAvatarDragging(false);
                if (e.dataTransfer.files?.[0]) handleAvatarFile(e.dataTransfer.files[0]);
              }}
              onClick={() => avatarInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
                isAvatarDragging
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                  : "border-brand-200 hover:border-brand-400 dark:border-brand-800"
              }`}
            >
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarFile(e.target.files?.[0])} />
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="mx-auto h-20 w-20 rounded-xl object-cover ring-2 ring-brand-400" />
              ) : (
                <>
                  <Camera className="mx-auto h-8 w-8 text-brand-400" />
                  <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Upload profile photo
                  </p>
                  <p className="text-xs text-slate-500">Drag & drop or click · max 10MB</p>
                </>
              )}
            </div>

            {message && (
              <div
                className={`rounded-xl border-2 px-4 py-3 text-sm font-medium ${
                  message.includes("success")
                    ? "border-success-500/30 bg-success-500/10 text-success-600"
                    : "border-brand-300 bg-brand-50 text-brand-800 dark:border-brand-700 dark:bg-brand-950/30 dark:text-brand-200"
                }`}
              >
                {message.includes("success") && <CheckCircle className="mr-2 inline h-4 w-4" />}
                {message}
              </div>
            )}

            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save profile"}
            </button>
          </form>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            {isOwnProfile ? "My projects" : `${profile.name}'s projects`}
          </h2>
          {isOwnProfile && (
            <Link to="/projects/new" className="btn-primary text-xs">
              + New project
            </Link>
          )}
        </div>
        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Post a project to start recruiting teammates."
            action={
              isOwnProfile ? (
                <Link to="/projects/new" className="btn-primary">
                  Post project
                </Link>
              ) : null
            }
          />
        ) : (
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
                  projectRequest={projectRequest}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
