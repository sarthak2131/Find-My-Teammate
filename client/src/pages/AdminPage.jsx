import { useEffect, useState } from "react";
import { 
  Shield, AlertTriangle, Check, Trash2, Users, Code2, ShieldAlert, Search, 
  UserMinus, UserCheck, RefreshCw, Eye 
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/shared/StatCard";
import EmptyState from "../components/shared/EmptyState";
import Avatar from "../components/shared/Avatar";

export default function AdminPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  
  // Search states for directories
  const [userSearch, setUserSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const loadOverview = async () => {
    try {
      const { data } = await api.get("/users/admin/overview");
      setOverview(data);
    } catch (err) {
      setFeedback("Failed to load admin analytics.");
    }
  };

  const loadReports = async () => {
    try {
      const { data } = await api.get("/reports");
      // Filter out resolved reports for pending reports list
      setReports(data.reports || []);
    } catch (err) {
      setFeedback("Failed to load reports.");
    }
  };

  const loadAllUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setAllUsers(data.users || []);
    } catch (err) {
      setFeedback("Failed to load users directory.");
    }
  };

  const loadAllProjects = async () => {
    try {
      const { data } = await api.get("/projects", {
        params: { excludeShowcase: "true" }
      });
      const filtered = (data.projects || []).filter(
        (p) => !p.isShowcase && !p.description?.includes("GitHub: https://github.com/")
      );
      setAllProjects(filtered);
    } catch (err) {
      setFeedback("Failed to load projects directory.");
    }
  };

  const loadTabContent = async () => {
    if (user?.role !== "admin") return;
    setLoading(true);
    setFeedback("");
    
    if (activeTab === "overview") {
      await loadOverview();
    } else if (activeTab === "reports") {
      await loadReports();
    } else if (activeTab === "users") {
      await loadAllUsers();
    } else if (activeTab === "projects") {
      await loadAllProjects();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTabContent();
  }, [user, activeTab]);

  // Admin action: Resolve/Dismiss Report
  const handleResolveReport = async (reportId) => {
    setActionLoading(true);
    try {
      await api.put(`/reports/${reportId}`);
      setFeedback("Report dismissed and marked resolved.");
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      setTimeout(() => setFeedback(""), 3500);
    } catch (err) {
      setFeedback(err.response?.data?.message || "Failed to resolve report.");
    } finally {
      setActionLoading(false);
    }
  };

  // Admin action: Delete project/post
  const handleDeleteProject = async (projectId, reportIdToClear) => {
    if (!window.confirm("Permanently delete this hackathon post? This cannot be undone.")) return;
    setActionLoading(true);
    try {
      await api.delete(`/projects/${projectId}`);
      setFeedback("Hackathon post deleted successfully.");
      
      // Update local state lists
      if (reportIdToClear) {
        setReports((prev) => prev.filter((r) => r._id !== reportIdToClear));
      }
      setAllProjects((prev) => prev.filter((p) => p._id !== projectId));
      
      setTimeout(() => setFeedback(""), 3500);
    } catch (err) {
      setFeedback(err.response?.data?.message || "Failed to delete project.");
    } finally {
      setActionLoading(false);
    }
  };

  // Admin action: Toggle suspend/unsuspend user
  const handleToggleSuspend = async (userId, currentSuspended, reason = "Reported violations of platform guidelines") => {
    const actionText = currentSuspended ? "unsuspend" : "suspend";
    if (!window.confirm(`Are you sure you want to ${actionText} this user's account?`)) return;
    
    setActionLoading(true);
    try {
      await api.put(`/users/${userId}/suspend`, { reason });
      setFeedback(`User account ${currentSuspended ? "unsuspended" : "suspended"} successfully.`);
      
      // Refresh active view data
      if (activeTab === "reports") {
        await loadReports();
      } else if (activeTab === "users") {
        await loadAllUsers();
      }
      
      setTimeout(() => setFeedback(""), 3500);
    } catch (err) {
      setFeedback(err.response?.data?.message || "Failed to update suspension status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Admin action: Delete user account
  const handleDeleteUser = async (userId, reportIdToClear) => {
    if (!window.confirm("CRITICAL: Permanently delete this user account and ALL their posted hackathons/requests? This cannot be undone.")) return;
    
    setActionLoading(true);
    try {
      await api.delete(`/users/${userId}`);
      setFeedback("User account and all associated data deleted successfully.");
      
      // Update local state lists
      if (reportIdToClear) {
        setReports((prev) => prev.filter((r) => r._id !== reportIdToClear));
      }
      setAllUsers((prev) => prev.filter((u) => u._id !== userId));
      
      setTimeout(() => setFeedback(""), 3500);
    } catch (err) {
      setFeedback(err.response?.data?.message || "Failed to delete user account.");
    } finally {
      setActionLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <EmptyState
        title="Admin access only"
        description="This panel is reserved for users with the admin role."
      />
    );
  }

  // Filter lists based on search inputs
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProjects = allProjects.filter(p =>
    p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
    (p.createdBy?.name || "").toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <section className="surface page-enter">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-3xl bg-brand-50 p-4 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Admin Panel</p>
              <h1 className="mt-2 text-2xl font-bold">Workspace Moderation Console</h1>
            </div>
          </div>
          <button 
            type="button" 
            onClick={loadTabContent}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            disabled={loading || actionLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      {/* Feedback Banner */}
      {feedback && (
        <div className="rounded-xl border border-brand-500/30 bg-brand-50/70 p-3 text-xs font-semibold text-brand-800 dark:bg-brand-950/20 dark:text-brand-300">
          {feedback}
        </div>
      )}

      {/* Admin Dashboard tabs are now placed in the sidebar navigation */}

      {loading ? (
        <div className="surface text-center py-12 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-500" />
          Loading console logs...
        </div>
      ) : (
        <div className="page-enter">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && overview && (
            <div className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <StatCard label="Users" value={overview.stats.userCount} />
                <StatCard label="Hackathons" value={overview.stats.projectCount} accent="coral" />
                <StatCard label="Requests" value={overview.stats.requestCount} />
                <StatCard label="Active Reports" value={overview.stats.reportCount} accent="red" />
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="surface">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Recent Users</p>
                  <div className="mt-4 space-y-3">
                    {overview.recentUsers.map((recentUser) => (
                      <div key={recentUser._id} className="surface-muted flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={recentUser.profileImage?.url}
                            alt={recentUser.name}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                          <div>
                            <p className="text-sm font-bold">{recentUser.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{recentUser.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {new Date(recentUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Recent Hackathon Posts</p>
                  <div className="mt-4 space-y-3">
                    {overview.recentProjects.map((project) => (
                      <div key={project._id} className="surface-muted flex items-center justify-between p-3">
                        <div>
                          <p className="text-sm font-bold truncate max-w-[240px]">{project.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            by {project.createdBy?.name || "Unknown creator"}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: PENDING REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              {reports.filter(r => r.status === "pending").length === 0 ? (
                <EmptyState
                  title="No pending reports"
                  description="Great! The platform is clean and no hackathon team calls have flags."
                />
              ) : (
                <div className="space-y-4">
                  {reports.filter(r => r.status === "pending").map((report) => (
                    <div 
                      key={report._id} 
                      className="surface border-l-4 border-red-500 p-5 bg-white dark:bg-slate-950/60"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                        <div>
                          <span className="chip bg-red-500/10 text-red-500 border-red-500/20 text-[10px] uppercase font-bold mb-2 inline-block">
                            Reported Hackathon
                          </span>
                          {report.project ? (
                            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                              {report.project.title}
                            </h3>
                          ) : (
                            <h3 className="text-sm font-bold text-red-500">[Post Deleted]</h3>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleResolveReport(report._id)}
                            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 hover:border-emerald-500 hover:text-emerald-600"
                            disabled={actionLoading}
                          >
                            <Check className="h-3.5 w-3.5" /> Dismiss Report
                          </button>
                          {report.project && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(report.project._id, report._id)}
                              className="inline-flex items-center gap-1 rounded-xl bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                              disabled={actionLoading}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete Post
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3 text-xs">
                        <div className="surface-muted p-3">
                          <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px] mb-1">Report Reason</p>
                          <div className="flex gap-2 items-start text-red-600 dark:text-red-400 font-semibold">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <p>{report.reason}</p>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2">
                            Reported on {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="surface-muted p-3">
                          <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px] mb-1">Reporter</p>
                          <p className="font-bold text-slate-900 dark:text-white">{report.reporter?.name}</p>
                          <p className="text-slate-400 mt-0.5">{report.reporter?.email}</p>
                        </div>

                        <div className="surface-muted p-3">
                          <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px] mb-1">Post Creator</p>
                          {report.project?.createdBy ? (
                            <>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {report.project.createdBy.name} 
                                {report.project.createdBy.isSuspended && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white rounded text-[8px] uppercase">Suspended</span>
                                )}
                              </p>
                              <p className="text-slate-400 mt-0.5">{report.project.createdBy.email}</p>
                              
                              <div className="flex gap-2 mt-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSuspend(report.project.createdBy._id, report.project.createdBy.isSuspended)}
                                  className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                                >
                                  {report.project.createdBy.isSuspended ? (
                                    <><UserCheck className="h-3 w-3" /> Unsuspend Account</>
                                  ) : (
                                    <><UserMinus className="h-3 w-3 text-red-500" /> Suspend Creator</>
                                  )}
                                </button>
                                <span className="text-slate-300 dark:text-slate-700">|</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(report.project.createdBy._id, report._id)}
                                  className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete Creator Account
                                </button>
                              </div>
                            </>
                          ) : (
                            <p className="text-slate-400 italic">Unknown / Deleted User</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANAGE USERS */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-10"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className="surface p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <th className="px-5 py-3.5">User</th>
                        <th className="px-5 py-3.5">Email</th>
                        <th className="px-5 py-3.5">Registered</th>
                        <th className="px-5 py-3.5">Role</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {filteredUsers.map((userItem) => (
                        <tr key={userItem._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                          <td className="px-5 py-3.5 flex items-center gap-3">
                            <Avatar
                              src={userItem.profileImage?.url}
                              alt={userItem.name}
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {userItem.name}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{userItem.email}</td>
                          <td className="px-5 py-3.5 text-slate-400">
                            {new Date(userItem.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              userItem.role === "admin" 
                                ? "bg-brand-500/15 text-brand-600 dark:text-brand-400" 
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {userItem.isSuspended ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-semibold text-[10px] uppercase">
                                <UserMinus className="h-3 w-3" /> Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-semibold text-[10px] uppercase">
                                <UserCheck className="h-3 w-3" /> Active
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {userItem.role !== "admin" ? (
                              <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSuspend(userItem._id, userItem.isSuspended)}
                                  className={`font-bold hover:underline ${
                                    userItem.isSuspended ? "text-emerald-600" : "text-red-500"
                                  }`}
                                >
                                  {userItem.isSuspended ? "Unsuspend" : "Suspend"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(userItem._id)}
                                  className="text-red-600 font-bold hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700 italic">No actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-slate-400">
                            No users matched your search term.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MANAGE PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-10"
                  placeholder="Search hackathons by title or creator name..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                />
              </div>

              <div className="surface p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <th className="px-5 py-3.5">Hackathon Call</th>
                        <th className="px-5 py-3.5">Host</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Skills Required</th>
                        <th className="px-5 py-3.5">Posted On</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {filteredProjects.map((projectItem) => (
                        <tr key={projectItem._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {projectItem.title}
                            </span>
                            {projectItem.isShowcase && (
                              <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded text-[9px] uppercase font-bold">
                                Showcase
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {projectItem.createdBy ? (
                              <Link 
                                to={`/profile/${projectItem.createdBy._id}`}
                                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                              >
                                {projectItem.createdBy.name}
                              </Link>
                            ) : (
                              <span className="text-slate-400 italic">Unknown</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              projectItem.status === "open"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : projectItem.status === "closed"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-amber-500/10 text-amber-500"
                            }`}>
                              {projectItem.status || "open"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">
                            {projectItem.requiredSkills?.length || 0} skills
                          </td>
                          <td className="px-5 py-3.5 text-slate-400">
                            {new Date(projectItem.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex justify-end gap-3">
                              <Link
                                to={`/projects/${projectItem._id}`}
                                className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(projectItem._id)}
                                className="text-red-500 font-bold hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProjects.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-slate-400">
                            No projects matched your search term.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
