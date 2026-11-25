import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Send,
  Lock,
  Headphones,
  User,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Sliders,
  Bold,
  Code,
  Paperclip,
  UserPlus,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [queueTickets, setQueueTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [error, setError] = useState('');
  const [queueSearch, setQueueSearch] = useState('');

  const loadTicketData = async (targetId) => {
    setLoading(true);
    setError('');
    try {
      // 1. Load ticket
      const ticketRes = await api.get(`/tickets/${targetId}`);
      const tData = ticketRes.data.data.ticket;
      setTicket(tData);

      // 2. Load comments
      const commentsRes = await api.get(`/tickets/${targetId}/comments`);
      if (commentsRes.data?.data?.comments) {
        setComments(commentsRes.data.data.comments);
      }

      // 3. Load activities
      const actRes = await api.get(`/tickets/${targetId}/activity`);
      if (actRes.data?.data?.activities) {
        setActivities(actRes.data.data.activities);
      }

      // 4. If admin, also load queue list for left pane
      if (isAdmin) {
        const queueRes = await api.get('/admin/tickets?limit=8&status=open');
        if (queueRes.data?.data) {
          setQueueTickets(queueRes.data.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadTicketData(id);
    }
  }, [id, isAdmin]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSendingReply(true);
    try {
      await api.post(`/tickets/${ticket._id}/comments`, {
        message: replyMessage,
        isInternal: isAdmin ? isInternal : false,
      });

      setReplyMessage('');
      // Reload comments and activities
      const [commentsRes, actRes] = await Promise.all([
        api.get(`/tickets/${ticket._id}/comments`),
        api.get(`/tickets/${ticket._id}/activity`),
      ]);
      if (commentsRes.data?.data?.comments) setComments(commentsRes.data.data.comments);
      if (actRes.data?.data?.activities) setActivities(actRes.data.data.activities);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.patch(`/admin/tickets/${ticket._id}/status`, { status: newStatus });
      setTicket(res.data.data.ticket);
      const actRes = await api.get(`/tickets/${ticket._id}/activity`);
      if (actRes.data?.data?.activities) setActivities(actRes.data.data.activities);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const res = await api.patch(`/admin/tickets/${ticket._id}/priority`, { priority: newPriority });
      setTicket(res.data.data.ticket);
      const actRes = await api.get(`/tickets/${ticket._id}/activity`);
      if (actRes.data?.data?.activities) setActivities(actRes.data.data.activities);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update priority.');
    }
  };

  const handleAssignToMe = async () => {
    try {
      const res = await api.patch(`/admin/tickets/${ticket._id}/assign`, { assigneeId: user.id });
      setTicket(res.data.data.ticket);
      const actRes = await api.get(`/tickets/${ticket._id}/activity`);
      if (actRes.data?.data?.activities) setActivities(actRes.data.data.activities);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign ticket.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-on-surface-variant font-body-md">
        Loading ticket details...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-space-xl bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant flex flex-col items-center gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-error" />
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Unable to open ticket</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">{error || 'Ticket not found'}</p>
        <Link
          to={isAdmin ? '/admin/tickets' : '/tickets'}
          className="mt-2 px-space-md py-space-sm rounded-lg bg-primary text-on-primary font-title-sm text-title-sm"
        >
          Back to Tickets
        </Link>
      </div>
    );
  }

  const filteredQueue = queueTickets.filter(
    (q) =>
      q.ticketId.toLowerCase().includes(queueSearch.toLowerCase()) ||
      q.title.toLowerCase().includes(queueSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full gap-space-md">
      {/* Top Workspace Action Bar */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={isAdmin ? '/admin/tickets' : '/tickets'}
            className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-outline-variant transition-colors"
            title="Back to Tickets"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase tracking-wider font-semibold">
            {isAdmin ? 'Live Queue' : 'Support Desk'}
          </span>
          <div className="hidden sm:flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
            <span>Ticket: <strong className="text-on-surface">{ticket.ticketId}</strong></span>
            <span>•</span>
            <span className="text-primary font-medium">Category: {ticket.category}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAssignToMe}
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm border border-outline-variant hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-primary" />
              <span>Assign to Me</span>
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('resolved')}
              className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Resolved</span>
            </button>
          </div>
        )}
      </div>

      {/* 3-Pane / Split-Pane Workspace */}
      <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
        {/* LEFT PANE (Queue list - visible for Admins) */}
        {isAdmin && (
          <section className="w-full lg:w-80 shrink-0 bg-surface-container-low rounded-xl p-3 flex flex-col gap-3 shadow-sm border border-outline-variant">
            <div className="flex items-center justify-between px-1">
              <span className="font-title-sm text-title-sm text-on-surface">Support Queue</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                {queueTickets.length}
              </span>
            </div>

            <input
              type="text"
              value={queueSearch}
              onChange={(e) => setQueueSearch(e.target.value)}
              placeholder="Filter by ID or subject..."
              className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm focus:outline-none shadow-sm border border-outline-variant"
            />

            <div className="flex flex-col gap-2 max-h-[580px] overflow-y-auto">
              {filteredQueue.map((item) => {
                const isSelected = item._id === ticket._id;
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => navigate(`/tickets/${item._id}`)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1.5 relative overflow-hidden border ${
                      isSelected
                        ? 'bg-surface-container-lowest shadow-md border-primary'
                        : 'bg-surface-container-lowest/70 hover:bg-surface-container-lowest border-outline-variant'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary-container" />
                    )}
                    <div className="flex items-center justify-between gap-2 pl-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.priority === 'urgent'
                              ? 'bg-error'
                              : item.priority === 'high'
                              ? 'bg-tertiary-container'
                              : 'bg-primary-container'
                          }`}
                        />
                        <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wide">
                          {item.ticketId}
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {new Date(item.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="font-title-sm text-title-sm text-on-surface line-clamp-2 pl-1.5">
                      {item.title}
                    </p>

                    <div className="flex items-center justify-between pl-1.5 pt-0.5">
                      <StatusBadge status={item.status} />
                      <span className="font-label-sm text-label-sm text-on-surface-variant truncate max-w-[100px]">
                        {item.createdBy?.name || 'Customer'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* CENTER PANE: Conversation Thread & Composer */}
        <section className="flex-1 min-w-0 w-full bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant flex flex-col overflow-hidden">
          {/* Ticket Header Banner */}
          <div className="p-5 bg-surface-container-low/60 border-b border-outline-variant flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                  {ticket.ticketId}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant capitalize">
                  {ticket.category} Support
                </span>
                <span className="text-on-surface-variant">•</span>
                <span className="font-label-sm text-label-sm text-primary flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {ticket.title}
            </h2>

            {/* Original Ticket Description */}
            <div className="mt-2 p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="p-5 flex flex-col gap-4 max-h-[520px] overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-center py-6 text-on-surface-variant font-body-sm">
                No replies in this thread yet. Be the first to respond!
              </p>
            ) : (
              comments.map((c) => {
                const isAuthorAdmin = c.userId?.role === 'admin';
                const isCurrentUser = c.userId?._id === user?.id;

                // Internal note (amber tinted)
                if (c.isInternal) {
                  return (
                    <div key={c._id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4 text-tertiary-container" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-title-sm text-title-sm text-on-surface">
                            {c.userId?.name || 'Support Admin'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
                            Internal Note
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {new Date(c.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="p-4 rounded-xl rounded-tl-sm bg-tertiary-fixed/40 border border-tertiary-container/20 text-on-surface font-body-md text-body-md leading-relaxed whitespace-pre-wrap">
                          {c.message}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Public Reply from Support Admin
                if (isAuthorAdmin) {
                  return (
                    <div key={c._id} className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                        <Headphones className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1 items-end">
                        <div className="flex items-center gap-2">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {new Date(c.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                            Support Team
                          </span>
                          <span className="font-title-sm text-title-sm text-on-surface">
                            {c.userId?.name || 'Support Admin'}
                          </span>
                        </div>
                        <div className="p-4 rounded-xl rounded-tr-sm bg-primary-fixed/40 border border-primary-container/20 text-on-surface font-body-md text-body-md leading-relaxed max-w-[90%] whitespace-pre-wrap">
                          {c.message}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Customer message
                return (
                  <div key={c._id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center shrink-0 font-label-md text-label-md font-semibold">
                      {c.userId?.name ? c.userId.name.substring(0, 2).toUpperCase() : 'CU'}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-title-sm text-title-sm text-on-surface">
                          {c.userId?.name || 'Customer'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                          Requester
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {new Date(c.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl rounded-tl-sm bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md leading-relaxed whitespace-pre-wrap">
                        {c.message}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Composer */}
          <form
            onSubmit={handleSendReply}
            className={`p-4 border-t border-outline-variant flex flex-col gap-3 transition-colors ${
              isInternal ? 'bg-tertiary-fixed/20' : 'bg-surface-container-low/70'
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {isAdmin ? (
                <div className="flex items-center gap-1 bg-surface-container-highest p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setIsInternal(false)}
                    className={`px-3 py-1 rounded-md font-label-md text-label-md transition-all ${
                      !isInternal
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Public Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInternal(true)}
                    className={`px-3 py-1 rounded-md font-label-md text-label-md transition-all flex items-center gap-1 ${
                      isInternal
                        ? 'bg-tertiary-container text-white shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Internal Note</span>
                  </button>
                </div>
              ) : (
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Add a comment or response
                </span>
              )}

              <div className="flex items-center gap-1 text-on-surface-variant">
                <button
                  type="button"
                  title="Bold"
                  onClick={() => setReplyMessage((prev) => `${prev} **bold**`)}
                  className="p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Code"
                  onClick={() => setReplyMessage((prev) => `${prev} \`code\``)}
                  className="p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors"
                >
                  <Code className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              required
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder={
                isInternal
                  ? 'Add private internal notes (visible only to support agents & admins)...'
                  : 'Write a response to the customer...'
              }
              className="w-full p-3 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:outline-none shadow-sm border border-outline-variant resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {isInternal
                  ? 'Locked: Only visible to internal operations staff'
                  : 'Visible to requester and support agents'}
              </span>
              <button
                type="submit"
                disabled={sendingReply}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span>{sendingReply ? 'Sending...' : isInternal ? 'Save Internal Note' : 'Send Reply'}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT PANE (280px): Ticket Properties & Activity History */}
        <aside className="w-full lg:w-[280px] shrink-0 bg-surface-container-low rounded-xl p-4 flex flex-col gap-5 shadow-sm border border-outline-variant">
          <div className="flex items-center justify-between">
            <span className="font-title-sm text-title-sm text-on-surface">Ticket Properties</span>
            <Sliders className="w-4 h-4 text-on-surface-variant" />
          </div>

          {/* Properties Form Controls */}
          <div className="flex flex-col gap-3.5">
            {/* Status */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="prop-status"
                className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold"
              >
                Status
              </label>
              {isAdmin ? (
                <select
                  id="prop-status"
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-sm border border-outline-variant focus:outline-none cursor-pointer"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              ) : (
                <div className="px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant">
                  <StatusBadge status={ticket.status} />
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="prop-priority"
                className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold"
              >
                Priority
              </label>
              {isAdmin ? (
                <select
                  id="prop-priority"
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-sm border border-outline-variant focus:outline-none cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              ) : (
                <div className="px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant">
                  <PriorityBadge priority={ticket.priority} />
                </div>
              )}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Category
              </span>
              <div className="px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-sm border border-outline-variant flex items-center justify-between capitalize">
                <span>{ticket.category}</span>
                <span className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>

            {/* Requester */}
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Requester
              </span>
              <div className="px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-sm border border-outline-variant flex flex-col">
                <span className="font-medium">{ticket.createdBy?.name || 'Customer'}</span>
                <span className="text-on-surface-variant text-label-sm truncate">
                  {ticket.createdBy?.email}
                </span>
              </div>
            </div>

            {/* Assignee */}
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Assignee
              </span>
              <div className="px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-sm border border-outline-variant flex items-center justify-between">
                <span>{ticket.assignedTo?.name || 'Unassigned'}</span>
                <User className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

          {/* Activity History Timeline */}
          <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant">
            <span className="font-title-sm text-title-sm text-on-surface">Activity History</span>
            <div className="flex flex-col gap-3 relative pl-3">
              <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-surface-container-highest" />

              {activities.length === 0 ? (
                <span className="text-on-surface-variant text-body-sm">No activity recorded.</span>
              ) : (
                activities.slice(0, 6).map((act) => (
                  <div key={act._id} className="flex items-start gap-2.5 relative">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 -ml-[12px] ${
                        act.eventType.includes('resolved')
                          ? 'bg-[#059669]'
                          : act.eventType.includes('created')
                          ? 'bg-outline'
                          : act.eventType.includes('comment')
                          ? 'bg-primary'
                          : 'bg-primary-container'
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className="font-body-sm text-body-sm text-on-surface leading-tight">
                        {act.description}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
