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
  Plus,
  Check,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProjectCard from "../components/shared/ProjectCard";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import ReportModal from "../components/shared/ReportModal";
import Avatar from "../components/shared/Avatar";
import { defaultAvatar } from "../utils/defaultAvatar";
import { USER_GENDER_OPTIONS, getUserGenderLabel } from "../utils/genderPreferences";


const extractGithubUsername = (val) => {
  if (!val) return "";
  try {
    const clean = val.trim().replace(/\/$/, "");
    if (clean.includes("github.com/")) {
      const parts = clean.split("github.com/");
      const namePart = parts[parts.length - 1];
      const name = namePart.split("/")[0].split("?")[0];
      return name;
    }
    if (!clean.includes("/") && !clean.includes(".")) {
      return clean;
    }
    const parts = clean.split("/");
    const last = parts[parts.length - 1];
    if (last && !last.includes(".") && last !== "github.com") {
      return last;
    }
  } catch (e) {
    // ignore
  }
  return [];
};

const DICEBEAR_STYLES = [
  "adventurer", "bottts", "pixel-art", "lorelei", "avataaars", "big-smile", "shapes", "fun-emoji"
];

const POPULAR_SKILLS = [
  "React", "Next.js", "Node.js", "Python", "Django", "MongoDB", "Tailwind CSS",
  "UI/UX Design", "Figma", "Machine Learning", "Flutter", "Java", "AWS", "Docker", "C++", "JavaScript", "TypeScript"
];

const POPULAR_INTERESTS = [
  "Hackathons", "Open Source", "Startups", "Web3/Blockchain", "Competitive Programming",
  "App Development", "Artificial Intelligence", "Cybersecurity", "Cloud Computing", "Game Development",
  "UI/UX Research", "Product Management"
];

export default function ProfilePage() {
  const { id } = useParams();
  const { user, updateLocalUser } = useAuth();
  const [reportTarget, setReportTarget] = useState(null);
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
  const [diceBearAvatars, setDiceBearAvatars] = useState([]);

  const [skillsSuggestions, setSkillsSuggestions] = useState([]);
  const [showSkillsSuggestions, setShowSkillsSuggestions] = useState(false);
  const skillsAutocompleteRef = useRef(null);

  const [interestsSuggestions, setInterestsSuggestions] = useState([]);
  const [showInterestsSuggestions, setShowInterestsSuggestions] = useState(false);
  const interestsAutocompleteRef = useRef(null);

  const [githubSuggestion, setGithubSuggestion] = useState("");
  const [showGithubSuggestion, setShowGithubSuggestion] = useState(false);
  const githubAutocompleteRef = useRef(null);

  useEffect(() => {
    // Generate 8 initial random DiceBear avatars
    setDiceBearAvatars(
      DICEBEAR_STYLES.map((style) => {
        const seed = Math.floor(100000 + Math.random() * 900000);
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
      })
    );
  }, []);
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

  // GitHub Importer States
  const [githubRepos, setGithubRepos] = useState([]);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [githubError, setGithubError] = useState("");
  const [importedRepoIds, setImportedRepoIds] = useState(new Set());
  const [importingRepoId, setImportingRepoId] = useState(null);

  // Debounced GitHub repos fetcher
  useEffect(() => {
    const username = extractGithubUsername(form.githubLink);
    if (!username) {
      setGithubRepos([]);
      setGithubError("");
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setFetchingRepos(true);
      setGithubError("");
      try {
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=12`
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("GitHub user not found.");
          }
          throw new Error("Could not fetch repositories.");
        }
        const data = await response.json();
        if (data.length === 0) {
          setGithubError("No public repositories found.");
          setGithubRepos([]);
        } else {
          setGithubRepos(data);
        }
      } catch (err) {
        setGithubError(err.message || "Something went wrong.");
        setGithubRepos([]);
      } finally {
        setFetchingRepos(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [form.githubLink]);

  const handleReportSubmit = async (reason) => {
    if (!reportTarget) return;
    await api.post("/reports", {
      projectId: reportTarget._id,
      reason,
    });
  };

  const handleSkillsChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, skills: value }));
    const parts = value.split(",");
    const lastTerm = parts[parts.length - 1].trim();
    if (!lastTerm) {
      setSkillsSuggestions([]);
      setShowSkillsSuggestions(false);
      return;
    }
    const added = parts.slice(0, -1).map((p) => p.trim().toLowerCase());
    const matches = POPULAR_SKILLS.filter(
      (s) => s.toLowerCase().includes(lastTerm.toLowerCase()) && !added.includes(s.toLowerCase())
    ).slice(0, 6);
    setSkillsSuggestions(matches);
    setShowSkillsSuggestions(matches.length > 0);
  };

  const selectSkillSuggestion = (skill) => {
    const parts = form.skills.split(",");
    parts[parts.length - 1] = ` ${skill}`;
    setForm((prev) => ({ ...prev, skills: parts.join(",").trim() + ", " }));
    setShowSkillsSuggestions(false);
  };

  const handleInterestsChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, interests: value }));
    const parts = value.split(",");
    const lastTerm = parts[parts.length - 1].trim();
    if (!lastTerm) {
      setInterestsSuggestions([]);
      setShowInterestsSuggestions(false);
      return;
    }
    const added = parts.slice(0, -1).map((p) => p.trim().toLowerCase());
    const matches = POPULAR_INTERESTS.filter(
      (i) => i.toLowerCase().includes(lastTerm.toLowerCase()) && !added.includes(i.toLowerCase())
    ).slice(0, 6);
    setInterestsSuggestions(matches);
    setShowInterestsSuggestions(matches.length > 0);
  };

  const selectInterestSuggestion = (interest) => {
    const parts = form.interests.split(",");
    parts[parts.length - 1] = ` ${interest}`;
    setForm((prev) => ({ ...prev, interests: parts.join(",").trim() + ", " }));
    setShowInterestsSuggestions(false);
  };

  const handleGithubLinkChange = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, githubLink: val }));
    
    const trimmed = val.trim();
    if (!trimmed) {
      setGithubSuggestion("");
      setShowGithubSuggestion(false);
      return;
    }
    
    if (trimmed.startsWith("https://github.com/")) {
      setGithubSuggestion("");
      setShowGithubSuggestion(false);
      return;
    }
    
    let suggestedUrl = "";
    if (trimmed.startsWith("github.com/")) {
      suggestedUrl = `https://${trimmed}`;
    } else if (!trimmed.includes("/") && !trimmed.includes(".")) {
      suggestedUrl = `https://github.com/${trimmed}`;
    }
    
    if (suggestedUrl) {
      setGithubSuggestion(suggestedUrl);
      setShowGithubSuggestion(true);
    } else {
      setGithubSuggestion("");
      setShowGithubSuggestion(false);
    }
  };

  const selectGithubSuggestion = (url) => {
    setForm((prev) => ({ ...prev, githubLink: url }));
    setShowGithubSuggestion(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (skillsAutocompleteRef.current && !skillsAutocompleteRef.current.contains(e.target)) {
        setShowSkillsSuggestions(false);
      }
      if (interestsAutocompleteRef.current && !interestsAutocompleteRef.current.contains(e.target)) {
        setShowInterestsSuggestions(false);
      }
      if (githubAutocompleteRef.current && !githubAutocompleteRef.current.contains(e.target)) {
        setShowGithubSuggestion(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleQuickImport = async (repo) => {
    setImportingRepoId(repo.id);
    setMessage("");
    try {
      const payload = new FormData();
      payload.append("title", repo.name || "");
      payload.append("description", `${repo.description || "Collaboration workspace."}\n\nGitHub: ${repo.html_url}`);
      payload.append("requiredSkills", repo.language || "");
      payload.append("maxMembers", "4");
      payload.append("status", "open");
      payload.append("preferredGender", "any");
      payload.append("preferredTeammateNote", `To contribute to ${repo.name}`);
      payload.append("isShowcase", "true");

      const { data } = await api.post("/projects/create", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProjects((prev) => [data.project, ...prev]);
      setImportedRepoIds((prev) => new Set([...prev, repo.id]));
      setMessage(`Successfully imported and published ${repo.name}!`);
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setMessage(err.response?.data?.message || `Failed to import repository ${repo.name}.`);
    } finally {
      setImportingRepoId(null);
    }
  };

  const isAlreadyPublished = (repo) => {
    if (importedRepoIds.has(repo.id)) return true;
    return projects.some((p) => {
      const desc = p.description || "";
      return (
        p.title?.toLowerCase() === repo.name?.toLowerCase() ||
        desc.includes(repo.html_url) ||
        desc.includes(repo.html_url.replace("https://github.com/", ""))
      );
    });
  };

  const displayRepos = githubRepos.filter((repo) => !isAlreadyPublished(repo));

  const handleDelete = async (projectId) => {
    if (!window.confirm("Delete this project permanently?")) {
      return;
    }

    try {
      const deletedProject = projects.find((p) => p._id === projectId);
      await api.delete(`/projects/${projectId}`);
      setProjects((currentProjects) => currentProjects.filter((project) => project._id !== projectId));
      
      // If the deleted project was imported, remove its repo ID from importedRepoIds so it can reappear
      if (deletedProject) {
        const matchedRepo = githubRepos.find((r) => 
          r.name?.toLowerCase() === deletedProject.title?.toLowerCase() ||
          (deletedProject.description && deletedProject.description.includes(r.html_url))
        );
        if (matchedRepo) {
          setImportedRepoIds((prev) => {
            const next = new Set(prev);
            next.delete(matchedRepo.id);
            return next;
          });
        }
      }
      
      setMessage("Project deleted successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete project.");
    }
  };

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
        setAvatarPreview(profileRes.data.user.profileImage?.url || "");
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
      setAvatarPreview(data.user.profileImage?.url || "");
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
        description={profile.role === "admin" ? "Platform Administrator" : (profile.bio || "No bio added yet.")}
        stats={profile.role === "admin" ? [] : [
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
          {profile.role !== "admin" && profile.availability && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-success-500 px-3 py-0.5 text-[10px] font-bold text-white">
              Available
            </span>
          )}
        </div>
        <div className="flex-1 space-y-3">
          {profile.role !== "admin" && profile.availability && (
            <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <MapPin className="h-4 w-4 text-brand-500" />
              {profile.availability}
            </p>
          )}
          {profile.gender && profile.gender !== "prefer-not-to-say" && (
            <span className="chip">{getUserGenderLabel(profile.gender)}</span>
          )}
          {profile.role !== "admin" && skillsList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill) => (
                <span key={skill} className="chip">
                  {skill}
                </span>
              ))}
            </div>
          )}
          {profile.role !== "admin" && interestsList.length > 0 && (
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
            {profile.role === "admin" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">
                    Display name
                  </span>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
              </div>
            ) : (
              <>
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
                  <div className="relative" ref={githubAutocompleteRef}>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">GitHub</span>
                      <input
                        className="input"
                        value={form.githubLink}
                        onChange={handleGithubLinkChange}
                        placeholder="https://github.com/username"
                      />
                    </label>
                    {showGithubSuggestion && githubSuggestion && (
                      <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border-2 border-brand-200 bg-white shadow-card dark:border-brand-800 dark:bg-[#0c1824]">
                        <button
                          type="button"
                          onClick={() => selectGithubSuggestion(githubSuggestion)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-350"
                        >
                          <LinkIcon className="h-3.5 w-3.5 text-brand-500" />
                          <span>Use URL: <strong>{githubSuggestion}</strong></span>
                        </button>
                      </div>
                    )}
                  </div>
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
                  <div className="relative" ref={skillsAutocompleteRef}>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">
                        Skills (comma separated)
                      </span>
                      <input 
                        className="input" 
                        value={form.skills} 
                        onChange={handleSkillsChange}
                        placeholder="React, Next.js, Node.js..."
                      />
                    </label>
                    {showSkillsSuggestions && skillsSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border-2 border-brand-200 bg-white shadow-card dark:border-brand-800 dark:bg-[#0c1824]">
                        {skillsSuggestions.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => selectSkillSuggestion(skill)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-brand-50 dark:hover:bg-brand-950/40"
                          >
                            <Zap className="h-3.5 w-3.5 text-accent-500" /> {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={interestsAutocompleteRef}>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">
                        Interests (comma separated)
                      </span>
                      <input 
                        className="input" 
                        value={form.interests} 
                        onChange={handleInterestsChange}
                        placeholder="Hackathons, Startups, Open Source..."
                      />
                    </label>
                    {showInterestsSuggestions && interestsSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border-2 border-brand-200 bg-white shadow-card dark:border-brand-800 dark:bg-[#0c1824]">
                        {interestsSuggestions.map((interest) => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => selectInterestSuggestion(interest)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-brand-50 dark:hover:bg-brand-950/40"
                          >
                            <Star className="h-3.5 w-3.5 text-brand-500" /> {interest}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
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
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition flex flex-col justify-center items-center h-48 ${
                  isAvatarDragging
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                    : "border-brand-200 hover:border-brand-400 dark:border-brand-800"
                }`}
              >
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarFile(e.target.files?.[0])} />
                {avatarPreview && !avatarPreview.startsWith("https://api.dicebear.com/") ? (
                  <img src={avatarPreview} alt="Preview" className="mx-auto h-24 w-24 rounded-xl object-cover ring-2 ring-brand-400" />
                ) : (
                  <>
                    <Camera className="mx-auto h-8 w-8 text-brand-400" />
                    <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Upload custom photo
                    </p>
                    <p className="text-xs text-slate-500">Drag & drop or click · max 10MB</p>
                  </>
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/20">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Or select a 🎲 DiceBear avatar:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {diceBearAvatars.map((url, index) => {
                    const isSelected = form.profileImageUrl === url || avatarPreview === url;
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, profileImageUrl: url, profileImage: null }));
                          setAvatarPreview(url);
                        }}
                        className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-slate-100 dark:bg-slate-800 p-1.5 transition hover:scale-105 ${
                          isSelected
                            ? "border-brand-500 ring-2 ring-brand-500/20"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <img src={url} alt={`Avatar option ${index + 1}`} className="h-full w-full object-contain" />
                        {isSelected && (
                          <span className="absolute right-1 bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDiceBearAvatars(
                      DICEBEAR_STYLES.map((style) => {
                        const seed = Math.floor(100000 + Math.random() * 900000);
                        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
                      })
                    );
                  }}
                  className="btn-secondary py-1 px-2.5 text-[10px] font-bold inline-flex items-center gap-1.5"
                >
                  🎲 Roll New Avatars
                </button>
              </div>
            </div>

            {/* Quick Import Repositories Section */}
            {profile.role !== "admin" && displayRepos.length > 0 && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-brand-700 dark:text-brand-400">
                      <Github className="h-4 w-4" /> Quick Import Repositories
                    </h3>
                    <p className="text-xs text-slate-500">
                      Publish public projects to your showcase with one click
                    </p>
                  </div>
                  {fetchingRepos && (
                    <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {displayRepos.map((repo) => {
                    const isImported = importedRepoIds.has(repo.id);
                    const isImporting = importingRepoId === repo.id;

                    return (
                      <div
                        key={repo.id}
                        className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                      >
                        <div className="space-y-1">
                          <h4 className="truncate text-xs font-bold text-slate-800 dark:text-slate-200" title={repo.name}>
                            {repo.name}
                          </h4>
                          {repo.language && (
                            <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {repo.language}
                            </span>
                          )}
                          <p className="line-clamp-2 text-[10px] text-slate-500 dark:text-slate-400">
                            {repo.description || "No description provided."}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isImported || isImporting}
                          onClick={() => handleQuickImport(repo)}
                          className={`mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold transition ${
                            isImported
                              ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 cursor-not-allowed"
                              : "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-400 dark:hover:bg-brand-900"
                          }`}
                        >
                          {isImporting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : isImported ? (
                            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          {isImporting ? "Importing…" : isImported ? "Added" : "Import Showcase"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {fetchingRepos && displayRepos.length === 0 && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-6 dark:border-slate-800">
                <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                <span className="text-xs font-medium text-slate-500">Fetching repositories…</span>
              </div>
            )}

            {githubError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                {githubError}
              </div>
            )}

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

      {profile.role !== "admin" && (
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
                    onDelete={isOwnProfile ? handleDelete : null}
                    hideOwnerInfo={true}
                    onReport={setReportTarget}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
      <ReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmit={handleReportSubmit}
        projectTitle={reportTarget?.title || ""}
      />
    </div>
  );
}
