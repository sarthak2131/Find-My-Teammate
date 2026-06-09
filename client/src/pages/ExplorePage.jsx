import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search, Users, BadgeCheck, Filter, Compass } from "lucide-react";
import api from "../services/api";
import UserCard from "../components/shared/UserCard";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import { useSocketContext } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { getProjectGenderLabel } from "../utils/genderPreferences";

export default function ExplorePage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [requests, setRequests] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [contextLoading, setContextLoading] = useState(true);
  const deferredQuery = useDeferredValue(query);
  const { onlineUsers } = useSocketContext();

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);

      try {
        const usersResponse = await api.get("/users", {
          params: {
            search: deferredQuery || undefined,
            excludeSelf: true,
          },
        });

        setUsers(usersResponse.data.users || []);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [deferredQuery, user?._id]);

  useEffect(() => {
    const loadContext = async () => {
      setContextLoading(true);

      try {
        const [projectsResponse, requestsResponse] = await Promise.all([
          api.get("/projects", {
            params: {
              owner: user?._id,
              status: "open",
            },
          }),
          api.get("/requests", {
            params: {
              type: "all",
            },
          }),
        ]);

        const ownedProjects = projectsResponse.data.projects || [];
        setMyProjects(ownedProjects);
        setRequests(requestsResponse.data.requests || []);

        if (ownedProjects.length > 0) {
          setSelectedProjectId((current) =>
            current && ownedProjects.some((project) => project._id === current)
              ? current
              : ownedProjects[0]._id
          );
        } else {
          setSelectedProjectId("");
        }
      } finally {
        setContextLoading(false);
      }
    };

    if (user?._id) {
      loadContext();
    }
  }, [user?._id]);

  const selectedProject = useMemo(
    () => myProjects.find((project) => project._id === selectedProjectId) || null,
    [myProjects, selectedProjectId]
  );

  const handleInvite = async (member) => {
    if (!selectedProject) {
      setFeedback("Create an open project first, then you can invite teammates from Explore.");
      return;
    }

    try {
      const { data } = await api.post("/requests/send", {
        receiver: member._id,
        projectId: selectedProject._id,
        requestType: "invite",
      });

      setRequests((current) => [data.request, ...current]);
      setFeedback(`Invitation sent to ${member.name} for "${selectedProject.title}".`);
      
      // Auto clear feedback after 5 seconds
      setTimeout(() => setFeedback(""), 5000);
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to invite this teammate.");
    }
  };

  const getInviteState = (member) => {
    if (!selectedProject) {
      return {
        label: "Host team first",
        disabled: true,
        statusText: "Host an open team to invite teammates from Explore.",
        style: "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
      };
    }

    const alreadyMember = (selectedProject.members || []).some(
      (projectMember) => projectMember._id === member._id
    );

    if (alreadyMember) {
      return {
        label: "Joined Squad",
        disabled: true,
        statusText: `${member.name} is already part of "${selectedProject.title}".`,
        style: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed"
      };
    }

    if (selectedProject.preferredGender && selectedProject.preferredGender !== "any") {
      if (!["male", "female"].includes(member.gender)) {
        return {
          label: "Incomplete Profile",
          disabled: true,
          statusText: `${member.name} must set their gender profile before joining "${selectedProject.title}".`,
          style: "bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-not-allowed"
        };
      }

      if (member.gender !== selectedProject.preferredGender) {
        return {
          label: "Gender Match Req",
          disabled: true,
          statusText: `${selectedProject.title} is configured for ${getProjectGenderLabel(
            selectedProject.preferredGender
          ).toLowerCase()} participation.`,
          style: "bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed"
        };
      }
    }

    const activeRequest = requests.find(
      (request) =>
        request.projectId?._id === selectedProject._id &&
        request.requestType === "invite" &&
        request.sender?._id === user?._id &&
        request.receiver?._id === member._id &&
        request.status === "pending"
    );

    if (activeRequest) {
      return {
        label: "Invite Pending",
        disabled: true,
        statusText: `Invitation pending for "${selectedProject.title}".`,
        style: "bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-not-allowed font-semibold animate-pulse"
      };
    }

    return {
      label: "Invite Teammate",
      disabled: false,
      statusText: `Invite ${member.name} to "${selectedProject.title}".`,
      style: "btn-primary hover:border-brand-500 shadow-glow font-extrabold"
    };
  };

  // Quick skill filter shortcut buttons
  const quickSkills = ["React", "Node.js", "Python", "UI/UX", "Tailwind", "MongoDB", "AI/ML"];

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header & Glassmorphism Dashboard */}
      <PageHeader
        badge="Explore"
        badgeIcon={Compass}
        title="Find teammates"
        description="Browse profiles, filter by skills, invite to your projects."
      />

      <section className="surface page-enter">
          <div>
          <div className="mt-0">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search by skill or name
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  className="input pl-11"
                  value={query}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    startTransition(() => setQuery(nextValue));
                  }}
                  placeholder="Type skills e.g., Python, React, Next.js, Figma, Django..."
                />
              </div>
            </label>

            {/* Quick tag list click to search */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                <Filter className="h-3 w-3" />
                Popular:
              </span>
              {quickSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setQuery(skill)}
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                    query === skill 
                      ? "bg-brand-500/20 text-brand-400 border-brand-500/40 shadow-glow" 
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                  }`}
                >
                  {skill}
                </button>
              ))}
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* 3. Team Invitation Console */}
          <div className="mt-8 grid items-center gap-5 border-t border-slate-200 pt-6 dark:border-white/10 md:grid-cols-[1fr_260px]">
            <div className="surface-muted flex items-center gap-3.5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">Invite to your project</h4>
                <p className="mt-0.5 text-xs text-slate-500">
                  Pick an open project to enable invite buttons on profiles.
                </p>
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                Your open project
              </span>
              <select
                className="input py-2 font-semibold text-xs cursor-pointer"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                disabled={!myProjects.length || contextLoading}
              >
                {!myProjects.length ? <option value="">Host a squad first</option> : null}
                {myProjects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Live Action Alert Feedback */}
          {feedback ? (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-mint-500/30 bg-mint-500/10 px-4 py-3 text-xs font-semibold text-mint-600 dark:text-mint-400">
              <BadgeCheck className="h-4 w-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          ) : null}
        </div>
      </section>

      {/* 4. Hacker Cards Directory Grid */}
      <section className="grid gap-6 md:grid-cols-2">
        {loading ? (
          <div className="col-span-2 py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-xs font-semibold text-slate-500">Searching…</p>
          </div>
        ) : null}

        {!loading && users.length === 0 ? (
          <div className="col-span-2">
            <EmptyState
              title="No teammates found matching selection"
              description="Try typing a broader skill keyword or invite other teammates to complete their stack profiles."
            />
          </div>
        ) : null}

        {!loading
          ? users.map((member) => {
              const inviteState = getInviteState(member);
              return (
                <UserCard
                  key={member._id}
                  user={member}
                  isOnline={onlineUsers.includes(member._id)}
                  statusText={inviteState.statusText}
                  extraAction={
                    <button
                      type="button"
                      onClick={() => handleInvite(member)}
                      disabled={inviteState.disabled}
                      className={`w-full py-2 px-3 rounded-xl text-xs transition-all duration-200 flex items-center justify-center font-bold ${inviteState.style}`}
                    >
                      <span>{inviteState.label}</span>
                    </button>
                  }
                />
              );
            })
          : null}
      </section>
    </div>
  );
}

