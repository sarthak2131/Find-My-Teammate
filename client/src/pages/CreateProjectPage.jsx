import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UploadCloud,
  X,
  Film,
  Image as ImageIcon,
  Users,
  Calendar,
  Target,
  Zap,
  ChevronRight,
  Rocket,
  Loader2,
} from "lucide-react";
import api from "../services/api";
import { PROJECT_GENDER_OPTIONS } from "../utils/genderPreferences";
import { compressImageFile } from "../utils/compressImage";
import PageHeader from "../components/shared/PageHeader";

const initialForm = {
  title: "",
  description: "",
  requiredSkills: "",
  deadline: "",
  status: "open",
  preferredGender: "any",
  preferredTeammateNote: "",
};

const POPULAR_SKILLS = [
  "React", "Next.js", "Node.js", "Python", "Django", "MongoDB", "Tailwind CSS",
  "UI/UX Design", "Figma", "Machine Learning", "Flutter", "Java", "AWS", "Docker",
];

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [skillsSuggestions, setSkillsSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    api.get(`/projects/${id}`).then(({ data }) => {
      const project = data.project;
      setForm({
        title: project.title || "",
        description: project.description || "",
        requiredSkills: (project.requiredSkills || []).join(", "),
        deadline: project.deadline ? new Date(project.deadline).toISOString().substring(0, 10) : "",
        status: project.status || "open",
        preferredGender: project.preferredGender || "any",
        preferredTeammateNote: project.preferredTeammateNote || "",
      });
      if (project.posterUrl) setPosterPreview(project.posterUrl);
    }).catch(() => setError("Failed to load project."));
  }, [id, isEditMode]);

  useEffect(() => {
    const handler = (e) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clearPoster = () => {
    if (posterPreview?.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
    setPosterFile(null);
    setPosterPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = async (file) => {
    if (!file || file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }
    setError("");
    try {
      const prepared = file.type.startsWith("image/") ? await compressImageFile(file) : file;
      if (posterPreview?.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
      setPosterFile(prepared);
      setPosterPreview(URL.createObjectURL(prepared));
    } catch {
      setError("Could not process file.");
    }
  };

  const handleSkillsChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, requiredSkills: value }));
    const parts = value.split(",");
    const lastTerm = parts[parts.length - 1].trim();
    if (!lastTerm) {
      setSkillsSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const added = parts.slice(0, -1).map((p) => p.trim().toLowerCase());
    const matches = POPULAR_SKILLS.filter(
      (s) => s.toLowerCase().includes(lastTerm.toLowerCase()) && !added.includes(s.toLowerCase())
    ).slice(0, 6);
    setSkillsSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  };

  const selectSkillSuggestion = (skill) => {
    const parts = form.requiredSkills.split(",");
    parts[parts.length - 1] = ` ${skill}`;
    setForm((prev) => ({ ...prev, requiredSkills: parts.join(",").trim() + ", " }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      if (posterFile) payload.append("poster", posterFile);
      else if (isEditMode) payload.append("posterUrl", posterPreview || "");

      if (isEditMode) {
        await api.put(`/projects/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        navigate(`/projects/${id}`);
      } else {
        await api.post("/projects/create", payload, { headers: { "Content-Type": "multipart/form-data" } });
        navigate("/dashboard");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Could not ${isEditMode ? "update" : "create"} project.`);
    } finally {
      setSaving(false);
    }
  };

  const isVideoPoster = posterFile
    ? posterFile.type?.startsWith("video/")
    : posterPreview &&
      (posterPreview.startsWith("data:video/") || /\.(mp4|webm|ogg|mov)($|\?)/i.test(posterPreview));

  return (
    <div className="mx-auto max-w-4xl space-y-6 page-enter">
      <PageHeader
        badge={isEditMode ? "Edit project" : "New project"}
        badgeIcon={Rocket}
        title={isEditMode ? "Update your project" : "Post a new project"}
        description={
          isEditMode
            ? "Change details, poster, and who you're looking for."
            : "Describe your idea, add a poster, and recruit the perfect teammates."
        }
      />

      <form onSubmit={handleSubmit} className="surface space-y-0 divide-y-2 divide-brand-100 p-0 dark:divide-brand-900/50">
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-600">
            <Target className="h-4 w-4" /> Basics
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">Project title *</span>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="AI Resume Builder, Smart Campus App…" required />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-brand-400">
                <Calendar className="h-3.5 w-3.5" /> Deadline
              </span>
              <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">Status</span>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="open">Open — recruiting</option>
                <option value="in-progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">Description *</span>
            <textarea className="input min-h-36 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What are you building? What roles do you need?" required />
          </label>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-accent-600">
            <ImageIcon className="h-4 w-4" /> Poster (image or video)
          </div>
          {posterPreview ? (
            <div className="relative max-w-xs overflow-hidden rounded-xl border-2 border-brand-200">
              {isVideoPoster ? (
                <video src={posterPreview} controls className="w-full" />
              ) : (
                <img src={posterPreview} alt="Poster" className="w-full object-cover" />
              )}
              <button type="button" onClick={clearPoster} className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed py-12 text-center transition ${
                isDragging ? "border-brand-500 bg-brand-50" : "border-brand-200 hover:border-brand-400"
              }`}
            >
              <UploadCloud className="mx-auto h-10 w-10 text-brand-400" />
              <p className="mt-2 text-sm font-semibold">Drop poster here or click to browse</p>
              <p className="text-xs text-slate-500">Max 10MB</p>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          )}
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-600">
            <Users className="h-4 w-4" /> Team needs
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative sm:col-span-2" ref={autocompleteRef}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">Required skills</span>
                <input className="input" value={form.requiredSkills} onChange={handleSkillsChange} placeholder="React, Python, Figma…" />
              </label>
              {showSuggestions && (
                <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border-2 border-brand-200 bg-white shadow-card dark:border-brand-800 dark:bg-[#0c1824]">
                  {skillsSuggestions.map((skill) => (
                    <button key={skill} type="button" onClick={() => selectSkillSuggestion(skill)} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-brand-50 dark:hover:bg-brand-950/40">
                      <Zap className="h-3.5 w-3.5 text-accent-500" /> {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">Who can join?</span>
              <select className="input" value={form.preferredGender} onChange={(e) => setForm({ ...form, preferredGender: e.target.value })}>
                {PROJECT_GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-brand-700 dark:text-brand-400">Role note</span>
              <input className="input" value={form.preferredTeammateNote} onChange={(e) => setForm({ ...form, preferredTeammateNote: e.target.value })} placeholder="e.g. Backend dev with ML…" maxLength={200} />
            </label>
          </div>
        </div>

        {error && (
          <div className="mx-6 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex flex-wrap gap-3 p-6">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            {saving ? "Saving…" : isEditMode ? "Update project" : "Publish project"}
          </button>
          <button type="button" onClick={() => (isEditMode ? navigate(`/projects/${id}`) : (setForm(initialForm), clearPoster()))} className="btn-secondary">
            {isEditMode ? "Cancel" : "Reset"}
          </button>
        </div>
      </form>
    </div>
  );
}
