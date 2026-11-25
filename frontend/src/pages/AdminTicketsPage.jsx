import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, CheckCircle, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [statusCounts, setStatusCounts] = useState({ all: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [metrics, setMetrics] = useState({ avgFirstResponseTime: '14m', slaCompliance: 98.2 });

  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/tickets', {
        params: {
          status: activeStatusTab,
          search,
          priority: priorityFilter,
          assignee: assigneeFilter,
          page: pagination.page,
          limit: pagination.limit,
        },
      });

      if (res.data?.data) {
        setTickets(res.data.data);
        if (res.data.meta?.pagination) setPagination(res.data.meta.pagination);
        if (res.data.meta?.counts) setStatusCounts(res.data.meta.counts);
        if (res.data.meta?.metrics) setMetrics(res.data.meta.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch admin tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeStatusTab, priorityFilter, assigneeFilter, pagination.page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchTickets();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(tickets.map((t) => t._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Quick triage handler (in-place status / priority update)
  const handleQuickStatusUpdate = async (ticketId, nextStatus) => {
    try {
      await api.patch(`/admin/tickets/${ticketId}/status`, { status: nextStatus });
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleQuickPriorityUpdate = async (ticketId, nextPriority) => {
    try {
      await api.patch(`/admin/tickets/${ticketId}/priority`, { priority: nextPriority });
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update priority.');
    }
  };

  // Bulk actions
  const handleBulkMarkResolved = async () => {
    try {
      await Promise.all(
        selectedIds.map((tid) => api.patch(`/admin/tickets/${tid}/status`, { status: 'resolved' }))
      );
      setSelectedIds([]);
      fetchTickets();
    } catch (e) {
      alert('Failed to update some tickets.');
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Operational Telemetry Strip (Matching Stitch folder 4) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
              Total Volume
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-on-surface">
                {statusCounts.all}
              </span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">+8.4%</span>
            </div>
          </div>
          <svg className="w-16 h-8 text-primary" fill="none" viewBox="0 0 64 32">
            <path
              d="M2 26L14 20L24 23L36 12L48 15L62 5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d="M2 26L14 20L24 23L36 12L48 15L62 5V30H2V26Z"
              fill="currentColor"
              fillOpacity="0.12"
            />
          </svg>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
              Open Queue
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-on-surface">
                {statusCounts.open + statusCounts.in_progress}
              </span>
              <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                {statusCounts.open} Unassigned
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
            <SlidersHorizontal className="w-5 h-5 text-tertiary" />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
              Avg First Response
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-on-surface">
                {metrics.avgFirstResponseTime || '14m'}
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">Target &lt; 30m</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant">
            <span className="font-bold text-primary">⚡</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
              SLA Compliance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-on-surface">
                {metrics.slaCompliance !== undefined ? `${metrics.slaCompliance}%` : '98.2%'}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Target 95%</span>
            </div>
          </div>
          <svg className="w-10 h-10 text-secondary" viewBox="0 0 36 36">
            <circle cx="18" cy="18" fill="none" r="15" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3.5" />
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="15"
              stroke="currentColor"
              strokeDasharray="92 100"
              strokeLinecap="round"
              strokeWidth="3.5"
              transform="rotate(-90 18 18)"
            />
          </svg>
        </div>
      </div>

      {/* Main Tickets Surface */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant flex flex-col overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-space-md flex flex-col gap-space-md bg-surface-container-lowest border-b border-outline-variant">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              {[
                { id: 'all', label: 'All', count: statusCounts.all },
                { id: 'open', label: 'Open', count: statusCounts.open },
                { id: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
                { id: 'resolved', label: 'Resolved', count: statusCounts.resolved },
                { id: 'closed', label: 'Closed', count: statusCounts.closed },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveStatusTab(tab.id);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                    activeStatusTab === tab.id
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab.label} <span className="ml-1 opacity-75">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Search & Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-space-sm">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID or subject..."
                  className="pl-9 pr-3 py-1.5 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container transition-colors w-56 border border-transparent focus:border-primary"
                />
              </form>

              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-1.5 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none cursor-pointer border border-transparent focus:border-primary"
              >
                <option value="all">Priority: All</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={assigneeFilter}
                onChange={(e) => {
                  setAssigneeFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-1.5 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none cursor-pointer border border-transparent focus:border-primary"
              >
                <option value="all">Assignee: All</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between px-space-md py-2 rounded-lg bg-primary-fixed text-on-primary-fixed-variant">
              <div className="flex items-center gap-space-sm">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="font-label-md text-label-md font-semibold">
                  {selectedIds.length} tickets selected
                </span>
              </div>
              <div className="flex items-center gap-space-sm">
                <button
                  type="button"
                  onClick={handleBulkMarkResolved}
                  className="px-2.5 py-1 rounded-md bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 transition-opacity font-semibold shadow-sm"
                >
                  Mark Resolved
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-2 py-1 rounded-md font-label-sm text-label-sm hover:bg-primary/10 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Compact Data Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase font-semibold">
                <th className="py-2.5 pl-space-md pr-2 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length > 0 && selectedIds.length === tickets.length}
                    className="rounded cursor-pointer accent-primary"
                  />
                </th>
                <th className="py-2.5 px-3 w-28">Ticket ID</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3 w-32">Requester</th>
                <th className="py-2.5 px-3 w-32">Status</th>
                <th className="py-2.5 px-3 w-28">Priority</th>
                <th className="py-2.5 px-3 w-36">Assignee</th>
                <th className="py-2.5 px-3 w-28">Updated</th>
                <th className="py-2.5 pl-3 pr-space-md w-44 text-right">Quick Triage</th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-on-surface-variant">
                    Loading admin tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-on-surface-variant">
                    No tickets found matching current filters.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-surface-container-low/60 transition-colors border-t border-outline-variant"
                  >
                    <td className="py-3 pl-space-md pr-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(t._id)}
                        onChange={() => handleSelectOne(t._id)}
                        className="rounded cursor-pointer accent-primary"
                      />
                    </td>
                    <td className="py-3 px-3 font-title-sm text-title-sm text-primary font-semibold whitespace-nowrap">
                      <Link to={`/tickets/${t._id}`} className="hover:underline">
                        {t.ticketId}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-body-md text-body-md text-on-surface max-w-xs truncate">
                      <Link to={`/tickets/${t._id}`} className="hover:text-primary transition-colors">
                        {t.title}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                      {t.createdBy?.name || 'Customer'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3 px-3 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                      {t.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(t.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 pl-3 pr-space-md text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <select
                          value={t.status}
                          onChange={(e) => handleQuickStatusUpdate(t._id, e.target.value)}
                          className="px-2 py-1 rounded bg-surface-container font-label-sm text-label-sm border border-outline-variant focus:outline-none cursor-pointer"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                        <select
                          value={t.priority}
                          onChange={(e) => handleQuickPriorityUpdate(t._id, e.target.value)}
                          className="px-2 py-1 rounded bg-surface-container font-label-sm text-label-sm border border-outline-variant focus:outline-none cursor-pointer"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Med</option>
                          <option value="high">High</option>
                          <option value="urgent">Urg</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-space-md py-3 bg-surface-container-low flex items-center justify-between text-label-md font-label-md text-on-surface-variant border-t border-outline-variant">
          <span>
            Showing {tickets.length} of {pagination.total} tickets
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="px-2.5 py-1 rounded-md bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-sm border border-outline-variant disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-semibold text-on-surface">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="px-2.5 py-1 rounded-md bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
