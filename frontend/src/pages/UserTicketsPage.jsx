import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, active: 0 });

  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tickets', {
        params: {
          search,
          status: statusFilter,
          priority: priorityFilter,
          page: pagination.page,
          limit: pagination.limit,
        },
      });

      if (res.data && res.data.data) {
        setTickets(res.data.data);
        if (res.data.meta) {
          if (res.data.meta.pagination) setPagination(res.data.meta.pagination);
          if (res.data.meta.stats) setStats(res.data.meta.stats);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, pagination.page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchTickets();
  };

  const handleDelete = async (id, ticketId) => {
    if (!window.confirm(`Are you sure you want to delete ticket ${ticketId}?`)) {
      return;
    }
    try {
      await api.delete(`/tickets/${id}`);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete ticket.');
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">My Tickets</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Track and manage your support requests
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center gap-space-xs bg-primary-container text-on-primary-container hover:bg-primary transition-colors rounded-lg px-space-md py-space-sm font-title-sm text-title-sm shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Ticket</span>
        </Link>
      </div>

      {/* Operational Metric Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Active Requests
            </span>
            <div className="flex items-baseline gap-space-sm">
              <span className="font-headline-md text-headline-md text-on-surface">
                {stats.active || 0}
              </span>
              <span className="font-label-md text-label-md text-primary">
                {stats.open || 0} awaiting reply
              </span>
            </div>
          </div>
          <svg aria-hidden="true" className="w-20 h-10 text-primary shrink-0" fill="none" viewBox="0 0 80 40">
            <path
              d="M2 32 L16 26 L30 29 L44 16 L58 20 L78 8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <circle cx="78" cy="8" fill="currentColor" r="3" />
          </svg>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Avg. First Response
            </span>
            <div className="flex items-baseline gap-space-sm">
              <span className="font-headline-md text-headline-md text-on-surface">
                {stats.avgFirstResponseTime || '14m'}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                Target &lt; 30m
              </span>
            </div>
          </div>
          <svg aria-hidden="true" className="w-11 h-11 text-secondary shrink-0" fill="none" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" stroke="currentColor" strokeOpacity="0.18" strokeWidth="4" />
            <circle
              cx="22"
              cy="22"
              r="18"
              stroke="currentColor"
              strokeDasharray="113"
              strokeDashoffset="18"
              strokeLinecap="round"
              strokeWidth="4"
              transform="rotate(-90 22 22)"
            />
          </svg>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs min-w-0 w-full">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                SLA Health
              </span>
              <span className="font-label-md text-label-md text-primary font-semibold">
                {stats.slaCompliance !== undefined ? `${stats.slaCompliance}%` : '99.4%'}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mt-space-xs">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, stats.slaCompliance ?? 99.4))}%` }}
              />
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {stats.slaStatusText || 'All priority SLAs on track'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-space-sm bg-surface-container-low rounded-lg px-space-md py-space-sm flex-1 min-w-0"
        >
          <Search className="w-4 h-4 text-on-surface-variant shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Ticket ID or subject..."
            className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center gap-space-xs bg-surface-container-low rounded-lg px-space-md py-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="bg-transparent text-on-surface font-title-sm text-title-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-space-xs bg-surface-container-low rounded-lg px-space-md py-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="bg-transparent text-on-surface font-title-sm text-title-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="py-space-sm px-space-md font-label-sm text-label-sm text-on-surface-variant uppercase whitespace-nowrap font-semibold">
                  Ticket ID
                </th>
                <th className="py-space-sm px-space-md font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                  Subject
                </th>
                <th className="py-space-sm px-space-md font-label-sm text-label-sm text-on-surface-variant uppercase whitespace-nowrap font-semibold">
                  Category
                </th>
                <th className="py-space-sm px-space-md font-label-sm text-label-sm text-on-surface-variant uppercase whitespace-nowrap font-semibold">
                  Status
                </th>
                <th className="py-space-sm px-space-md font-label-sm text-label-sm text-on-surface-variant uppercase whitespace-nowrap font-semibold">
                  Priority
                </th>
                <th className="py-space-sm px-space-md font-label-sm text-label-sm text-on-surface-variant uppercase whitespace-nowrap font-semibold">
                  Last Updated
                </th>
                <th className="py-space-sm px-space-md font-label-sm text-label-sm text-on-surface-variant uppercase text-right whitespace-nowrap font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-on-surface-variant">
                    Loading your tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                      <p className="font-title-sm text-title-sm text-on-surface">No tickets found</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        You have no active support requests matching the criteria.
                      </p>
                      <Link
                        to="/tickets/new"
                        className="mt-2 text-primary font-medium hover:underline text-body-sm"
                      >
                        Submit a new ticket
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-surface-container-low/60 transition-colors border-t border-outline-variant"
                  >
                    <td className="py-space-md px-space-md font-title-sm text-title-sm text-primary whitespace-nowrap">
                      <Link to={`/tickets/${t._id}`} className="hover:underline">
                        {t.ticketId}
                      </Link>
                    </td>
                    <td className="py-space-md px-space-md font-body-md text-body-md text-on-surface max-w-xs truncate">
                      <Link to={`/tickets/${t._id}`} className="hover:text-primary transition-colors">
                        {t.title}
                      </Link>
                    </td>
                    <td className="py-space-md px-space-md font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap capitalize">
                      {t.category}
                    </td>
                    <td className="py-space-md px-space-md whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-space-md px-space-md whitespace-nowrap">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-space-md px-space-md font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(t.updatedAt).toLocaleDateString()}{' '}
                      {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-space-md px-space-md text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-space-xs">
                        <Link
                          to={`/tickets/${t._id}`}
                          className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
                          title="View / Edit Ticket"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(t._id, t.ticketId)}
                          className="p-space-xs rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-space-md py-3 bg-surface-container-low flex items-center justify-between text-label-md font-label-md text-on-surface-variant border-t border-outline-variant">
          <span>
            Showing {tickets.length} of {pagination.total || tickets.length} tickets
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
