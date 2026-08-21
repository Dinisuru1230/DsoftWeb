import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

const STATUS_CONFIG = {
  UNREAD: { label: 'Unread', icon: 'mark_email_unread', color: 'bg-primary-container text-primary font-bold' },
  READ: { label: 'Read', icon: 'mark_email_read', color: 'bg-surface-container text-on-surface-variant' },
  REPLIED: { label: 'Replied', icon: 'reply', color: 'bg-secondary-container text-on-secondary-container font-bold' },
  ARCHIVED: { label: 'Archived', icon: 'archive', color: 'bg-surface-container-low text-on-surface-variant' },
};

function formatDate(dt) {
  const d = new Date(dt);
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ContactManagement() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ unread: 0, read: 0, replied: 0, archived: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected message for detail view
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Reply
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [lastRepliedEmail, setLastRepliedEmail] = useState(null); // {email, body} for mailto prompt
  const scrollRef = useRef(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function fetchMessages() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== 'ALL') params.set('status', filterStatus);
    if (search) params.set('search', search);
    try {
      const res = await fetch(`${API_BASE}/contact?${params}`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
      else setError(data.error || 'Failed to load messages');
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/contact/stats`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch {}
  }

  useEffect(() => { fetchMessages(); fetchStats(); }, [filterStatus, search]);

  async function openMessage(msg) {
    setDetailLoading(true);
    setSelected(null);
    setReplyText('');
    setReplyError('');
    setLastRepliedEmail(null);
    try {
      const res = await fetch(`${API_BASE}/contact/${msg.id}`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setSelected(data.message);
        // Update local list status
        setMessages((prev) => prev.map((m) =>
          m.id === msg.id ? { ...m, status: data.message.status } : m
        ));
        fetchStats();
      }
    } catch {}
    setDetailLoading(false);
  }

  // Re-fetch selected message without clearing panel (for reply refresh)
  async function refreshSelected(msgId) {
    try {
      const res = await fetch(`${API_BASE}/contact/${msgId}`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setSelected(data.message);
        setMessages((prev) => prev.map((m) =>
          m.id === msgId ? { ...m, status: data.message.status } : m
        ));
        // Scroll replies into view
        setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 100);
      }
    } catch {}
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Please write a reply message.');
      setReplyError('Please write a reply.');
      return;
    }
    setReplying(true);
    setReplyError('');
    const toastId = toast.loading('Sending reply...');
    const sentBody = replyText.trim();
    const sentEmail = selected.email;
    const sentName = selected.name;
    const sentSubject = selected.subject;
    try {
      const res = await fetch(`${API_BASE}/contact/${selected.id}/reply`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ body: sentBody }),
      });
      const data = await res.json();
      if (res.ok) {
        setReplyText('');
        setMessages((prev) => prev.map((m) =>
          m.id === selected.id ? { ...m, status: 'REPLIED' } : m
        ));
        fetchStats();
        // Re-fetch to get fresh replies list from server
        await refreshSelected(selected.id);
        // Store email info for mailto prompt
        setLastRepliedEmail({ email: sentEmail, name: sentName, subject: sentSubject, body: sentBody });
        toast.success(`Reply saved for ${sentName}!`, { id: toastId });
      } else {
        const msg = data.error || 'Failed to send reply';
        setReplyError(msg);
        toast.error(msg, { id: toastId });
      }
    } catch {
      setReplyError('Network error');
      toast.error('Could not send reply. Network error.', { id: toastId });
    }
    setReplying(false);
  }

  async function handleStatusChange(msgId, newStatus) {
    const toastId = toast.loading('Updating status...');
    try {
      const res = await fetch(`${API_BASE}/contact/${msgId}/status`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, status: newStatus } : m));
        if (selected?.id === msgId) setSelected((prev) => ({ ...prev, status: newStatus }));
        fetchStats();
        toast.success(`Message status marked as ${newStatus}!`, { id: toastId });
      } else {
        toast.error('Failed to update status.', { id: toastId });
      }
    } catch {
      toast.error('Network error updating status.', { id: toastId });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const toastId = toast.loading('Deleting message...');
    try {
      const res = await fetch(`${API_BASE}/contact/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
        if (selected?.id === deleteTarget.id) setSelected(null);
        fetchStats();
        toast.success('Message deleted successfully.', { id: toastId });
      } else {
        toast.error('Failed to delete message.', { id: toastId });
      }
    } catch {
      toast.error('Network error deleting message.', { id: toastId });
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  const FILTER_TABS = [
    { key: 'ALL', label: 'All', count: stats.total },
    { key: 'UNREAD', label: 'Unread', count: stats.unread },
    { key: 'READ', label: 'Read', count: stats.read },
    { key: 'REPLIED', label: 'Replied', count: stats.replied },
    { key: 'ARCHIVED', label: 'Archived', count: stats.archived },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
      {/* ── Header ── */}
      <div>
        <h1 className="font-headline-md text-headline-md text-on-background mb-1">Messages Inbox</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Customer contact messages — view and reply directly from the admin panel.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-error-container text-on-error-container rounded-lg font-label-md flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-xs underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Messages', value: stats.total, icon: 'inbox', color: 'text-primary', bg: 'bg-primary-container/40' },
          { label: 'Unread', value: stats.unread, icon: 'mark_email_unread', color: 'text-primary', bg: 'bg-primary-container/70' },
          { label: 'Replied', value: stats.replied, icon: 'reply', color: 'text-secondary', bg: 'bg-secondary-container/50' },
          { label: 'Archived', value: stats.archived, icon: 'archive', color: 'text-on-surface-variant', bg: 'bg-surface-container' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient border border-outline-variant/20 flex items-center justify-between">
            <div>
              <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
            <div className={`w-11 h-11 rounded-full ${s.bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Panel: List + Detail ── */}
      <div className="flex gap-6 h-[calc(100vh-380px)] min-h-[500px]">

        {/* ── Left: Message List ── */}
        <div className="w-full md:w-[380px] flex-shrink-0 flex flex-col bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/20 overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-outline-variant/30 bg-surface-bright flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, subject..."
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-lg outline-none text-sm font-body-md border-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {/* Status Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                    filterStatus === tab.key
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-primary'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 ${
                      filterStatus === tab.key ? 'bg-white/20' : 'bg-outline-variant/30'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Message List Items */}
          <div className="flex-grow overflow-y-auto divide-y divide-outline-variant/20">
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                <span className="font-label-md text-sm">Loading...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-outline/50">inbox</span>
                <p className="font-label-md text-sm">No messages found</p>
              </div>
            ) : messages.map((msg) => {
              const cfg = STATUS_CONFIG[msg.status] || STATUS_CONFIG.READ;
              const isSelected = selected?.id === msg.id;
              return (
                <button
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`w-full text-left px-4 py-3 transition-colors group ${
                    isSelected ? 'bg-primary-container/30 border-l-4 border-primary' : 'hover:bg-surface-container-low border-l-4 border-transparent'
                  } ${msg.status === 'UNREAD' ? 'bg-primary-container/10' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 font-bold text-primary text-sm">
                        {msg.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm truncate ${msg.status === 'UNREAD' ? 'font-bold text-on-surface' : 'font-medium text-on-surface'}`}>
                          {msg.name}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate">{msg.email}</p>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <p className={`text-xs truncate ${msg.status === 'UNREAD' ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
                    {msg.subject}
                  </p>
                  <p className="text-[11px] text-outline mt-0.5">{formatDate(msg.createdAt)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: Message Detail ── */}
        <div className="flex-grow flex flex-col bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/20 overflow-hidden">
          {detailLoading ? (
            <div className="flex-grow flex items-center justify-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-2xl">sync</span>
              <span className="font-label-md">Loading message...</span>
            </div>
          ) : !selected ? (
            <div className="flex-grow flex flex-col items-center justify-center gap-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl text-outline/30">mark_email_unread</span>
              <div className="text-center">
                <p className="font-title-sm text-title-sm text-on-surface-variant">Select a message</p>
                <p className="font-body-md text-sm text-outline mt-1">Choose a message from the list to view it here</p>
              </div>
            </div>
          ) : (
            <>
              {/* Detail Header */}
              <div className="p-5 border-b border-outline-variant/30 bg-surface-bright flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow min-w-0">
                    <h2 className="font-title-sm text-lg text-on-surface font-bold truncate">{selected.subject}</h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="font-label-md text-sm text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        {selected.name}
                      </span>
                      <a href={`mailto:${selected.email}`} className="font-label-md text-sm text-on-surface-variant hover:text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                        {selected.email}
                      </a>
                      <span className="font-label-sm text-[11px] text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {formatDate(selected.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Status Dropdown */}
                    <div className="relative group">
                      <button className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-1 text-xs font-label-md border border-outline-variant px-3">
                        <span className="material-symbols-outlined text-[16px]">{STATUS_CONFIG[selected.status]?.icon}</span>
                        {STATUS_CONFIG[selected.status]?.label}
                        <span className="material-symbols-outlined text-[14px]">expand_more</span>
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-36 bg-surface-container-lowest rounded-lg shadow-2xl border border-outline-variant/30 z-10 hidden group-hover:block">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => handleStatusChange(selected.id, key)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-container transition-colors cursor-pointer ${selected.status === key ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
                          >
                            <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(selected)}
                      className="p-2 rounded-full hover:bg-error-container/30 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      title="Delete message"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="flex-grow overflow-y-auto p-5 flex flex-col gap-5" ref={scrollRef}>
                {/* Original Message */}
                <div className="bg-surface-container-low rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-outline-variant/40">
                    <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary">
                      {selected.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-label-md text-sm font-bold text-on-surface">{selected.name}</p>
                      <p className="text-xs text-outline">{selected.email}</p>
                    </div>
                  </div>
                  <p className="font-body-md text-on-surface whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                </div>

                {/* Admin Replies */}
                {selected.replies && selected.replies.length > 0 ? (
                  <div className="space-y-3">
                    <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">forum</span>
                      {selected.replies.length} Admin {selected.replies.length === 1 ? 'Reply' : 'Replies'}
                    </p>
                    {selected.replies.map((reply, idx) => (
                      <div key={reply.id || idx} className="bg-secondary-container/20 border-l-4 border-secondary rounded-r-xl p-4 ml-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary text-[14px]">admin_panel_settings</span>
                          </div>
                          <p className="font-label-md text-xs font-bold text-secondary">Admin Reply</p>
                          <span className="text-[10px] text-outline ml-auto">{reply.createdAt ? formatDate(reply.createdAt) : ''}</span>
                        </div>
                        <p className="font-body-md text-sm text-on-surface whitespace-pre-wrap leading-relaxed pl-9">{reply.body}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Email sent prompt — appears after reply is saved */}
                {lastRepliedEmail && (
                  <div className="bg-secondary-container/30 border border-secondary/40 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                      <p className="font-label-md text-sm font-bold text-secondary">Reply saved! Now email the customer.</p>
                    </div>
                    <p className="text-xs text-on-surface-variant font-body-md">
                      Your reply is saved in the system. Click below to send it to <strong>{lastRepliedEmail.email}</strong> via your email client:
                    </p>
                    <a
                      href={`mailto:${lastRepliedEmail.email}?subject=Re: ${encodeURIComponent(lastRepliedEmail.subject)}&body=${encodeURIComponent('Dear ' + lastRepliedEmail.name + ',\n\n' + lastRepliedEmail.body + '\n\nBest regards,\nMalmalee Creations Team\nhello@malmalee.lk')}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-full text-xs font-bold hover:bg-secondary/80 transition-colors w-fit cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      Open Email Client to Send
                    </a>
                    <button
                      onClick={() => setLastRepliedEmail(null)}
                      className="text-xs text-outline underline underline-offset-2 hover:text-primary w-fit cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              {/* ── Reply Form ── */}
              <div className="border-t border-outline-variant/30 p-4 bg-surface-bright flex-shrink-0">
                <form onSubmit={handleReply} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">reply</span>
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest flex-grow">Reply to {selected.name}</span>
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                      className="text-[11px] text-primary underline underline-offset-2 flex items-center gap-1 hover:text-primary/70 cursor-pointer"
                      title="Open in email client"
                    >
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      {selected.email}
                    </a>
                  </div>
                  {replyError && (
                    <p className="text-xs text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {replyError}
                    </p>
                  )}
                  <textarea
                    value={replyText}
                    onChange={(e) => { setReplyText(e.target.value); setReplyError(''); setLastRepliedEmail(null); }}
                    placeholder={`Write your reply to ${selected.name}...`}
                    rows={3}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md text-sm text-on-surface outline-none focus:border-primary resize-none transition-colors"
                  />
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={replying || !replyText.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-label-md text-sm hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-ambient"
                    >
                      {replying
                        ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                        : <span className="material-symbols-outlined text-[16px]">send</span>
                      }
                      {replying ? 'Saving...' : 'Save & Email Customer'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-5 p-3 bg-error-container/30 rounded-lg">
              <span className="material-symbols-outlined text-error mt-0.5">warning</span>
              <div>
                <p className="font-title-sm text-on-surface font-bold">Delete Message</p>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">
                  Delete message from <strong>{deleteTarget.name}</strong>? All replies will also be deleted.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 border border-outline-variant rounded-full font-label-md text-sm cursor-pointer hover:bg-surface-container transition-colors">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 bg-error text-white rounded-full font-label-md text-sm hover:bg-error/80 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {deleting
                  ? <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                  : <span className="material-symbols-outlined text-[14px]">delete</span>
                }
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
