import { Bell, CheckCheck, Users, Zap, MessageSquare, Award } from "lucide-react";
import { useSocketContext } from "../context/SocketContext";
import PageHeader from "../components/shared/PageHeader";
import { formatDateTime } from "../utils/formatters";

const notifTypeConfig = {
  request: { icon: Users, chip: "chip", label: "Request" },
  invite: { icon: Zap, chip: "chip-accent", label: "Invite" },
  message: { icon: MessageSquare, chip: "chip", label: "Message" },
  accepted: { icon: Award, chip: "chip", label: "Accepted" },
  default: { icon: Bell, chip: "chip", label: "Alert" },
};

function getNotifConfig(type) {
  if (!type) return notifTypeConfig.default;
  const key = Object.keys(notifTypeConfig).find((k) => type.toLowerCase().includes(k));
  return notifTypeConfig[key] || notifTypeConfig.default;
}

export default function NotificationsPage() {
  const {
    notifications,
    notificationsLoaded,
    markNotificationRead,
    markAllNotificationsRead,
  } = useSocketContext();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        badge="Activity"
        badgeIcon={Bell}
        title="Notifications"
        description="Join requests, invites, messages, and team updates — all in one place."
        stats={unreadCount > 0 ? [{ label: "Unread", value: unreadCount }] : []}
        action={
          <button type="button" onClick={markAllNotificationsRead} className="btn-secondary !border-white/40 !bg-white/15 !text-white hover:!bg-white/25">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        }
      />

      <div className="space-y-3">
        {!notificationsLoaded && (
          <div className="surface py-16 text-center">
            <Bell className="mx-auto h-8 w-8 animate-pulse text-brand-400" />
            <p className="mt-3 text-sm text-slate-500">Loading notifications…</p>
          </div>
        )}

        {notificationsLoaded && notifications.length === 0 && (
          <div className="surface py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-950/50">
              <Bell className="h-7 w-7 text-brand-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">All caught up!</h3>
            <p className="mt-2 text-sm text-slate-500">New activity will show up here.</p>
          </div>
        )}

        {notificationsLoaded &&
          notifications.map((notification) => {
            const config = getNotifConfig(notification.type);
            const Icon = config.icon;

            return (
              <div
                key={notification._id}
                className={`surface flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${
                  notification.isRead ? "opacity-70" : "ring-2 ring-brand-200 dark:ring-brand-800"
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className={config.chip}>{config.label}</span>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-accent-500" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      {notification.text}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(notification._id)}
                    className="btn-secondary shrink-0 text-xs"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Mark read
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
