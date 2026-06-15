import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Plus,
  User,
  Bookmark,
  Search,
  Compass,
  Home,
  Sparkles,
  ArrowRight,
  Loader2,
  Shield,
  AlertTriangle,
  Users,
  Code2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import BrandLogo from "../shared/BrandLogo";
import ThemeToggle from "../shared/ThemeToggle";
import Avatar from "../shared/Avatar";
import api from "../../services/api";

const navLinks = [
  { to: "/feed", label: "Arena", caption: "Active hackathons", icon: Home },
  { to: "/explore", label: "Explore", caption: "Scout teammates", icon: Compass },
  { to: "/hackathons/new", label: "Create", caption: "Post hackathon team call", icon: Plus },
  { to: "/dashboard", label: "Command", caption: "Manage squads", icon: LayoutDashboard },
  { to: "/likes", label: "Saved", caption: "Bookmarked posts", icon: Bookmark },
  { to: "/chat", label: "Chat", caption: "Direct messages", icon: MessageSquare },
  { to: "/notifications", label: "Alerts", caption: "Requests and updates", icon: Bell },
  { to: "/profile", label: "Profile", caption: "Builder identity", icon: User },
];

const panelMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" },
};

const bellVariants = {
  hover: {
    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
    transition: { duration: 0.5, ease: "easeInOut" }
  }
};

const POPULAR_SKILLS = [
  "React", "Next.js", "Node.js", "Python", "Django", "MongoDB", "Tailwind CSS",
  "UI/UX Design", "Figma", "Machine Learning", "Flutter", "Java", "AWS", "Docker", "C++", "JavaScript", "TypeScript"
];

const toastIconMap = {
  message: MessageSquare,
  request: Users,
  "request-update": Users,
  system: Bell,
};

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    unreadNotificationsCount,
    activeToast,
    clearActiveToast,
    markNotificationRead,
  } = useSocketContext();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        clearActiveToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast, clearActiveToast]);

  const handleToastClick = async () => {
    if (!activeToast) return;
    const toast = activeToast;
    clearActiveToast();

    try {
      await markNotificationRead(toast._id);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }

    if (toast.type === "message") {
      navigate(`/chat?user=${toast.referenceId}`);
    } else if (toast.type === "request" || toast.type === "request-update") {
      navigate("/dashboard");
    } else {
      navigate("/notifications");
    }
  };

  const handleLogout = () => {
    navigate("/login", { replace: true, state: null });
    logout();
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ projects: [], users: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeCount = true;

  const activeNavLinks = user?.role === "admin"
    ? [
        { to: "/admin?tab=overview", label: "Overview", caption: "System health", icon: Shield },
        { to: "/admin?tab=reports", label: "Reports", caption: "Flags & violations", icon: AlertTriangle },
        { to: "/admin?tab=users", label: "Users", caption: "Manage profiles", icon: Users },
        { to: "/admin?tab=projects", label: "Hackathons", caption: "Recruitment calls", icon: Code2 },
        { to: "/profile", label: "Profile", caption: "Admin settings", icon: User },
      ]
    : navLinks;

  const isLinkActive = (to) => {
    if (to.includes("?")) {
      return location.pathname + location.search === to;
    }
    return location.pathname === to;
  };

  useEffect(() => {
    if (user?.role === "admin") {
      const currentPath = location.pathname;
      const isAdminAllowed = 
        currentPath.startsWith("/admin") ||
        currentPath.startsWith("/profile") ||
        (currentPath.startsWith("/projects/") && !currentPath.endsWith("/edit") && currentPath !== "/projects/new");
      
      if (!isAdminAllowed) {
        navigate("/admin?tab=overview", { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  const submitSearch = () => {
    const query = searchQuery.trim();
    if (query) {
      if (location.pathname === "/explore") {
        navigate(`/explore?search=${encodeURIComponent(query)}`);
      } else {
        navigate(`/feed?search=${encodeURIComponent(query)}`);
      }
      setShowSearchDropdown(false);
    }
  };

  useEffect(() => {
    const term = searchQuery.trim();
    if (!term) {
      setSearchResults({ projects: [], users: [] });
      setShowSearchDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      setShowSearchDropdown(true);
      try {
        const [projectsResponse, usersResponse] = await Promise.all([
          api.get("/projects", {
            params: {
              search: term,
              excludeShowcase: "true",
            },
          }),
          api.get("/users", {
            params: {
              search: term,
            },
          }),
        ]);

        setSearchResults({
          projects: projectsResponse.data.projects || [],
          users: usersResponse.data.users || [],
        });
      } catch (err) {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="festival-shell min-h-screen font-body text-slate-700 dark:text-slate-200">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[320px] bg-[radial-gradient(circle_at_top_left,rgba(243,107,33,0.14),transparent_36%),radial-gradient(circle_at_top_right,rgba(234,181,89,0.16),transparent_28%)]" />

      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
        <motion.div
          {...panelMotion}
          className="group mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 rounded-full border border-slate-200/50 bg-white/70 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:border-slate-800/50 dark:bg-slate-950/60 dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-500 hover:border-brand-500/20 dark:hover:border-accent-500/20 backdrop-blur-md relative sm:px-5"
        >
          {/* Ambient Glow Aura */}
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-brand-500/10 via-transparent to-accent-500/10 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-full border border-slate-200 bg-white/75 p-2.5 text-slate-700 transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-200 xl:hidden hover:scale-[1.04] active:scale-[0.96] duration-200 shadow-sm"
            >
              <Menu className="h-5 w-5" />
            </button>
            <BrandLogo to={user?.role === "admin" ? "/admin" : "/feed"} size="sm" className="transition hover:scale-[1.02] active:scale-[0.98] duration-300" />
          </div>

          {user?.role !== "admin" && (
            <div className="relative hidden max-w-xl flex-1 xl:block" ref={searchContainerRef}>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                className="w-full rounded-full border border-slate-200/50 bg-slate-50/50 dark:bg-slate-900/40 dark:border-slate-800/40 py-2.5 pl-11 pr-36 text-xs text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 focus:bg-white dark:focus:bg-slate-950 shadow-inner"
                placeholder="Search hackathons, skills, stacks..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setShowSearchDropdown(true);
                  }
                }}
                onKeyDown={(event) => event.key === "Enter" && submitSearch()}
              />
              {/* Keyboard Shortcut Tag */}
              <div className="absolute right-[5.5rem] top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none rounded-md border border-slate-200/60 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-500 shadow-sm">
                <span className="text-[10px]">Ctrl</span>
                <span>+</span>
                <span>K</span>
              </div>
              <button
                type="button"
                onClick={submitSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition duration-300 hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                Search
              </button>

            {/* Global Search Suggestions Dropdown */}
            {showSearchDropdown && (searchQuery.trim().length > 0) && (
              <div className="absolute left-0 right-0 z-50 mt-2 max-h-[420px] overflow-y-auto rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-festival backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
                {searching ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                    <span className="text-xs font-medium">Searching FMT...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 1. Projects/Hackathons Section */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                        Active Hackathons
                      </h4>
                      {searchResults.projects.length === 0 ? (
                        <p className="text-xs text-slate-400 px-1 py-1">No matching hackathons</p>
                      ) : (
                        <div className="space-y-1">
                          {searchResults.projects.slice(0, 5).map((project) => (
                            <button
                              key={project._id}
                              type="button"
                              onClick={() => {
                                navigate(`/projects/${project._id}`);
                                setShowSearchDropdown(false);
                                setSearchQuery("");
                              }}
                              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {project.title}
                                </p>
                                <p className="truncate text-[10px] text-slate-400">
                                  {project.description}
                                </p>
                              </div>
                              <span className="shrink-0 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                                {project.status || "open"}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. Builders/Users Section */}
                    <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                        Builders & Teammates
                      </h4>
                      {searchResults.users.length === 0 ? (
                        <p className="text-xs text-slate-400 px-1 py-1">No matching builders</p>
                      ) : (
                        <div className="space-y-1">
                          {searchResults.users.slice(0, 5).map((member) => (
                            <button
                              key={member._id}
                              type="button"
                              onClick={() => {
                                navigate(`/profile/${member._id}`);
                                setShowSearchDropdown(false);
                                setSearchQuery("");
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            >
                              <div className="h-8 w-8 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                                <Avatar
                                  src={member.profileImage?.url}
                                  alt={member.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {member.name}
                                </p>
                                <p className="truncate text-[10px] text-slate-400">
                                  {member.skills?.join(", ") || "No skills added yet"}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. Skills Section */}
                    {searchQuery.trim() && POPULAR_SKILLS.filter(s => s.toLowerCase().includes(searchQuery.trim().toLowerCase())).length > 0 && (
                      <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-2 px-1">
                          {POPULAR_SKILLS.filter(s => s.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 4).map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => {
                                navigate(`/explore?search=${encodeURIComponent(skill)}`);
                                setShowSearchDropdown(false);
                                setSearchQuery("");
                              }}
                              className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-400 transition"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          <div className="flex items-center gap-2">
            {user?.role !== "admin" && (
              <motion.div whileHover="hover" className="relative">
                <Link
                  to="/notifications"
                  className="relative block rounded-full border border-slate-200/60 bg-white/80 p-2.5 text-slate-600 transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-800/60 dark:bg-slate-950/80 dark:text-slate-300 hover:scale-[1.04] active:scale-[0.96] duration-200 shadow-sm"
                >
                  <motion.div variants={bellVariants}>
                    <Bell className="h-4 w-4" />
                  </motion.div>
                  {unreadNotificationsCount > 0 && (
                    <motion.span
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-1 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                    >
                      {unreadNotificationsCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            )}
            <ThemeToggle className="!rounded-full !border-slate-200/60 !bg-white/80 dark:!border-slate-800/60 dark:!bg-slate-950/80 hover:scale-[1.05] active:scale-[0.95] duration-300 hover:rotate-12 shadow-sm" />
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 p-1 pr-3.5 transition duration-300 hover:border-brand-500/30 hover:bg-white dark:border-slate-800/60 dark:bg-slate-950/80 dark:hover:border-accent-500/30 dark:hover:bg-slate-950 hover:shadow-sm"
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-brand-500/10">
                  <Avatar
                    src={user?.avatar || user?.profileImage?.url}
                    alt={user?.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                    {user?.name?.split(" ")[0]}
                  </p>
                  <p className="mt-0.5 text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide uppercase leading-none">
                    {user?.role === "admin" ? "Admin" : "Builder"}
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:border-slate-800/80 dark:bg-slate-950/95 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-md"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-900 mb-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {user?.name}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white transition"
                      >
                        <User className="h-3.5 w-3.5" />
                        <span>Profile</span>
                      </Link>
                      {user?.role !== "admin" && (
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white transition"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/20 transition"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                      
                      <div className="my-1 border-t border-slate-100 dark:border-slate-900" />
                      
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </header>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-6 px-4 pb-8 pt-6 sm:px-6">
        <aside className="hidden w-72 shrink-0 xl:block">
          <motion.div {...panelMotion} className="sticky top-28 space-y-4">
            <div className="rounded-[30px] border border-slate-200/50 bg-white/70 p-4 shadow-sm dark:border-slate-800/50 dark:bg-slate-950/60 backdrop-blur-md relative group/sidebar">
              <div className="absolute inset-0 -z-10 rounded-[30px] bg-gradient-to-br from-brand-500/5 via-transparent to-accent-500/5 opacity-0 blur-sm transition-opacity duration-500 group-hover/sidebar:opacity-100 pointer-events-none" />
              
              <div className="mb-4 flex items-center justify-between px-2 pt-1">
                <div>
                  <p className="festival-label text-[10px] tracking-[0.25em]">Navigation</p>
                  <p className="mt-1 text-base font-bold text-slate-800 dark:text-white font-display tracking-tight">
                    Hackathon workspace
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{activeCount ? "Active" : "Ready"}</span>
                </div>
              </div>

              <nav className="space-y-1">
                {activeNavLinks.map(({ to, label, caption, icon: Icon }) => {
                  const active = isLinkActive(to);
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={`group/item flex items-center justify-between rounded-2xl px-3 py-2.5 transition-all duration-300 relative overflow-hidden ${
                        active
                          ? "bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 text-white shadow-[0_18px_32px_-20px_rgba(243,107,33,0.85)]"
                          : "text-slate-600 hover:bg-slate-50 hover:translate-x-1 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition duration-300 ${
                            active
                              ? "bg-white/20 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] text-white"
                              : "bg-slate-100 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 group-hover/item:text-brand-600 dark:group-hover/item:text-accent-400"
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{label}</p>
                          <p
                            className={`text-[10px] transition-colors duration-300 ${
                              active ? "text-white/70" : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {caption}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className={`h-3.5 w-3.5 relative z-10 transition duration-300 ${
                        active ? "text-white translate-x-0" : "text-slate-300 dark:text-slate-600 group-hover/item:translate-x-1 group-hover/item:text-brand-500 dark:group-hover/item:text-accent-400"
                      }`} />
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 xl:hidden"
          >
            <div
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="festival-card absolute left-4 top-4 bottom-4 flex w-[min(320px,calc(100vw-2rem))] flex-col overflow-hidden p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <BrandLogo to={user?.role === "admin" ? "/admin" : "/feed"} size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-slate-200 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {user?.role !== "admin" && (
                <div className="relative mb-4">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input pl-11"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        submitSearch();
                        setMobileOpen(false);
                      }
                    }}
                  />
                </div>
              )}

              <nav className="space-y-1 overflow-y-auto">
                {activeNavLinks.map(({ to, label, caption, icon: Icon }) => {
                  const active = isLinkActive(to);
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`group/item flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-300 relative overflow-hidden ${
                        active
                          ? "bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 text-white shadow-[0_18px_32px_-20px_rgba(243,107,33,0.85)]"
                          : "text-slate-600 hover:bg-slate-50 hover:translate-x-1 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900/50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition duration-300 ${
                          active
                            ? "bg-white/20 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] text-white"
                            : "bg-slate-100 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 group-hover/item:text-brand-600 dark:group-hover/item:text-accent-400"
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{label}</p>
                        <p
                          className={`text-[10px] transition-colors duration-300 ${
                            active ? "text-white/70" : "text-slate-500 dark:text-slate-500"
                          }`}
                        >
                          {caption}
                        </p>
                      </div>
                    </NavLink>
                  );
                })}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-x-4 top-6 z-50 mx-auto max-w-sm cursor-pointer rounded-2xl border border-slate-200/50 bg-white/85 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/85 dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98] duration-200"
            onClick={handleToastClick}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/25 dark:text-brand-400">
                {(() => {
                  const Icon = toastIconMap[activeToast.type] || Bell;
                  return <Icon className="h-4 w-4" />;
                })()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  {activeToast.type === "message" ? "New Message" : "Squad Notification"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {activeToast.text}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearActiveToast();
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-900 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
