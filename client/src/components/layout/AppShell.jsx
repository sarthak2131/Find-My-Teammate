import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import BrandLogo from "../shared/BrandLogo";
import ThemeToggle from "../shared/ThemeToggle";
import Avatar from "../shared/Avatar";

const navLinks = [
  { to: "/feed", label: "Discover", icon: Home },
  { to: "/explore", label: "Find People", icon: Compass },
  { to: "/projects/new", label: "New Project", icon: Plus },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/likes", label: "Saved", icon: Bookmark },
  { to: "/chat", label: "Messages", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadNotificationsCount } = useSocketContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col font-body">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-lg dark:border-slate-700/60 dark:bg-ink/95">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800/60">
              <Menu className="h-5 w-5 text-brand-600" />
            </button>
            <BrandLogo to="/feed" size="sm" />
          </div>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
            <input
              className="input py-2 pl-10"
              placeholder="Search projects, skills…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchQuery.trim() && navigate(`/feed?search=${encodeURIComponent(searchQuery.trim())}`)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <div className="relative">
              <button type="button" onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-xl border border-slate-200 p-1 pr-2 dark:border-slate-600">
                <div className="h-8 w-8 overflow-hidden rounded-lg ring-2 ring-brand-400/80">
                  <Avatar src={user?.avatar || user?.profileImage?.url} alt={user?.name} className="h-full w-full object-cover" />
                </div>
                <span className="hidden text-sm font-bold sm:block dark:text-white">{user?.name?.split(" ")[0]}</span>
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-44 animate-rise rounded-xl border border-slate-200 bg-white p-1 shadow-card dark:border-slate-600 dark:bg-surface-dark">
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700/50">Profile</Link>
                    <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700/50">Dashboard</Link>
                    <hr className="my-1 border-slate-200 dark:border-slate-600" />
                    <button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-5 px-4 py-5 sm:px-6">
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="surface sticky top-24 space-y-0.5 p-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "nav-active"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50"
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px] text-brand-500" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex w-72 flex-col bg-white p-4 dark:bg-surface-dark">
            <div className="mb-4 flex justify-between">
              <BrandLogo to="/feed" size="sm" />
              <button type="button" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? "nav-active" : ""}`}>
                  <Icon className="h-5 w-5 text-brand-500" /> {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
