import { useEffect, useRef, useState } from "react";
import { ArrowRight, Send, MessageSquare, Loader2, Wifi, WifiOff } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";
import { formatDateTime } from "../utils/formatters";
import PageHeader from "../components/shared/PageHeader";
import Avatar from "../components/shared/Avatar";

export default function ChatPage() {
  const { user } = useAuth();
  const { onlineUsers, lastMessage, clearLastMessage, typingUsers, emitTyping } = useSocketContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(searchParams.get("user") || "");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const activeUserId = searchParams.get("user");
      try {
        const { data } = await api.get("/messages");
        let nextUsers = (data.conversations || []).map((c) => ({
          ...c.user,
          lastMessage: c.lastMessage,
          updatedAt: c.updatedAt,
        }));
        if (activeUserId && activeUserId !== user?._id && !nextUsers.some((m) => m._id === activeUserId)) {
          try {
            const userResponse = await api.get(`/users/${activeUserId}`);
            nextUsers = [userResponse.data.user, ...nextUsers];
          } catch {
            setSelectedUserId("");
            setSearchParams({}, { replace: true });
          }
        }
        setUsers(nextUsers);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [searchParams, setSearchParams, user?._id]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, []);

  useEffect(() => {
    const activeUser = searchParams.get("user");
    if (activeUser && activeUser !== user?._id) setSelectedUserId(activeUser);
    else if (activeUser === user?._id) {
      setSelectedUserId("");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, user?._id]);

  useEffect(() => {
    if (!selectedUserId) return;
    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${selectedUserId}`);
        setMessages(data.messages || []);
        setError("");
      } catch (requestError) {
        setMessages([]);
        setError(requestError.response?.data?.message || "Unable to load messages.");
      }
    };
    loadMessages();
  }, [selectedUserId]);

  useEffect(() => {
    if (!lastMessage || !selectedUserId) return;
    const isRelevant =
      lastMessage.sender?._id === selectedUserId || lastMessage.receiver?._id === selectedUserId;
    if (isRelevant) {
      setMessages((current) => [...current, lastMessage]);
      clearLastMessage();
    }
  }, [lastMessage, selectedUserId, clearLastMessage]);

  const handleComposerChange = (event) => {
    setDraft(event.target.value);
    if (!selectedUserId) return;
    emitTyping(selectedUserId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(selectedUserId, false), 1200);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !selectedUserId) return;
    const { data } = await api.post("/messages/send", {
      receiver: selectedUserId,
      message: draft.trim(),
    });
    setMessages((current) => [...current, data.message]);
    setDraft("");
    emitTyping(selectedUserId, false);
  };

  const selectedUser = users.find((m) => m._id === selectedUserId);

  return (
    <div className="space-y-4 page-enter">
      <PageHeader
        badge="Messages"
        badgeIcon={MessageSquare}
        title="Team chat"
        description="Talk to teammates in real time. Green dot = online."
      />

      <div className="grid h-[calc(100vh-14rem)] gap-4 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="surface flex flex-col overflow-hidden p-0">
          <div className="border-b-2 border-brand-100 px-4 py-3 dark:border-brand-900/50">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              Conversations
            </p>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2 scrollbar-none">
            {loading && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
              </div>
            )}
            {!loading && users.length === 0 && (
              <div className="px-3 py-8 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-brand-300" />
                <p className="mt-2 text-xs text-slate-500">No chats yet</p>
                <Link to="/explore" className="btn-primary mt-4 w-full text-xs">
                  Find teammates <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
            {users.map((member) => {
              const isOnline = onlineUsers.includes(member._id);
              const isSelected = selectedUserId === member._id;
              return (
                <button
                  key={member._id}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(member._id);
                    setSearchParams({ user: member._id }, { replace: true });
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                    isSelected
                      ? "bg-brand-100 dark:bg-brand-950/60"
                      : "hover:bg-brand-50 dark:hover:bg-brand-950/30"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 overflow-hidden rounded-xl ring-2 ring-brand-200 dark:ring-brand-800">
                      <Avatar src={member.profileImage?.url} alt={member.name} className="h-full w-full object-cover" />
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-ink ${
                        isOnline ? "bg-success-500" : "bg-slate-300"
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{member.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {member.lastMessage || "Start a conversation"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Chat panel */}
        <section className="surface flex flex-col overflow-hidden p-0">
          {selectedUser ? (
            <>
              <div className="flex items-center gap-4 border-b-2 border-brand-100 px-5 py-4 dark:border-brand-900/50">
                <div className="relative">
                  <div className="h-11 w-11 overflow-hidden rounded-xl ring-2 ring-brand-300">
                    <Avatar src={selectedUser.profileImage?.url} alt={selectedUser.name} className="h-full w-full object-cover" />
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                      onlineUsers.includes(selectedUserId) ? "bg-success-500" : "bg-slate-300"
                    }`}
                  />
                </div>
                <div>
                  <h2 className="font-display font-bold text-slate-900 dark:text-white">{selectedUser.name}</h2>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    {typingUsers[selectedUserId] ? (
                      <span className="font-medium text-brand-600">{typingUsers[selectedUserId]} is typing…</span>
                    ) : onlineUsers.includes(selectedUserId) ? (
                      <>
                        <Wifi className="h-3 w-3 text-success-500" />
                        <span className="text-success-600">Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3" /> Offline
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 scrollbar-none">
                {error && (
                  <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {messages.length === 0 && !error && (
                  <p className="py-12 text-center text-sm text-slate-500">Say hello! 👋</p>
                )}
                {messages.map((msg) => {
                  const isMine = msg.sender?._id === user?._id;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={isMine ? "chat-bubble-me max-w-[85%]" : "chat-bubble-them max-w-[85%]"}>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <p className={`mt-1 text-[10px] ${isMine ? "text-brand-100" : "text-slate-400"}`}>
                          {formatDateTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="flex gap-2 border-t-2 border-brand-100 p-4 dark:border-brand-900/50"
              >
                <input
                  className="input flex-1"
                  value={draft}
                  onChange={handleComposerChange}
                  placeholder="Type a message…"
                />
                <button type="submit" disabled={!draft.trim()} className="btn-primary h-11 w-11 shrink-0 !px-0">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-950/50">
                <MessageSquare className="h-8 w-8 text-brand-500" />
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Select a conversation
              </h2>
              <p className="mt-2 max-w-xs text-sm text-slate-500">
                Pick someone from the left, or find new teammates to chat with.
              </p>
              <Link to="/explore" className="btn-primary mt-6">
                Find teammates <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
