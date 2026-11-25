import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, History, Calendar, User, Shield, Layers } from 'lucide-react';
import api from '../api/client';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7d');
  const [events24h, setEvents24h] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/activity', {
        params: {
          search,
          eventType: actionFilter,
          dateRange: dateFilter,
          page: pagination.page,
          limit: pagination.limit,
        },
      });

      if (res.data?.data) {
        setLogs(res.data.data);
        if (res.data.meta?.pagination) setPagination(res.data.meta.pagination);
        if (res.data.meta?.events24h) setEvents24h(res.data.meta.events24h);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, dateFilter, pagination.page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'Actor', 'Role', 'EventType', 'Description', 'TicketID'];
    const rows = logs.map((l) => [
      new Date(l.createdAt).toISOString(),
      `"${l.actorId?.name || 'System'}"`,
      `"${l.actorId?.role || 'system'}"`,
      `"${l.eventType}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.ticketId?.ticketId || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `supportdesk_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Editorial Header & Live Audit Stream Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
              Operations / Security
            </span>
            <span className="text-outline-variant">•</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live Audit Stream
            </span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
            Activity Logs
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Chronological immutable record of ticket mutations, actor events, and system automations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini Sparkline Card */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                24h Events
              </span>
              <span className="font-title-md text-title-md text-on-surface tabular-nums font-bold">
                {events24h}
              </span>
            </div>
            <svg className="w-20 h-7 text-primary" fill="none" viewBox="0 0 80 28">
              <path
                d="M2 22L12 18L22 20L32 10L42 14L52 6L62 11L78 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M2 22L12 18L22 20L32 10L42 14L52 6L62 11L78 4V26H2V22Z"
                fill="currentColor"
                fillOpacity="0.1"
              />
            </svg>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high shadow-sm border border-outline-variant transition-colors font-label-md text-label-md cursor-pointer font-semibold"
          >
            <Download className="w-4 h-4 text-on-surface-variant" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-4 flex flex-col gap-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs by keyword or ticket..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container-low text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container border border-transparent focus:border-primary transition-colors"
            />
          </div>

          {/* Action Type Filter */}
          <div className="md:col-span-4 relative">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-body-sm text-on-surface focus:outline-none focus:bg-surface-container border border-transparent focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">All Action Types</option>
              <option value="ticket.created">Ticket Created</option>
              <option value="ticket.status_changed">Status Changed</option>
              <option value="ticket.priority_changed">Priority Updated</option>
              <option value="comment.added">Comment Added</option>
              <option value="ticket.assigned">Assigned</option>
              <option value="ticket.resolved">Ticket Resolved</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="md:col-span-3 relative">
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-body-sm text-on-surface focus:outline-none focus:bg-surface-container border border-transparent focus:border-primary transition-colors cursor-pointer"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </form>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
            <span className="font-semibold text-on-surface">{pagination.total}</span>
            <span>audit events matching criteria</span>
          </div>
        </div>
      </div>

      {/* Chronological Audit Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-4 whitespace-nowrap">Actor</th>
                <th className="py-3 px-4">Action Description</th>
                <th className="py-3 px-4 whitespace-nowrap">Ticket ID</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Event Key</th>
              </tr>
            </thead>
            <tbody className="text-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-on-surface-variant">
                    Loading audit stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="w-8 h-8 text-primary" />
                      <p className="font-title-sm text-title-sm text-on-surface">No matching audit logs</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                        Try adjusting your filters or date range to inspect historical events.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-surface-container-low/60 transition-colors border-t border-outline-variant"
                  >
                    <td className="py-3 px-4 font-mono text-label-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-[10px] font-bold">
                          {log.actorId?.name ? log.actorId.name.substring(0, 1) : 'S'}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface">
                            {log.actorId?.name || 'System Automation'}
                          </span>
                          <span className="text-[11px] text-on-surface-variant capitalize">
                            {log.actorId?.role || 'system'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-body-sm text-on-surface">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.ticketId ? (
                        <Link
                          to={`/tickets/${log.ticketId._id || log.ticketId}`}
                          className="font-title-sm text-title-sm text-primary hover:underline font-semibold"
                        >
                          {log.ticketId.ticketId || log.metadata?.ticketId || 'View'}
                        </Link>
                      ) : (
                        <span className="text-on-surface-variant text-label-sm">System</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant">
                        {log.eventType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-surface-container-low flex items-center justify-between border-t border-outline-variant">
          <span className="font-label-md text-label-md text-on-surface-variant">
            Page <span className="font-semibold text-on-surface">{pagination.page}</span> of{' '}
            <span className="font-semibold text-on-surface">{pagination.totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="px-2.5 py-1 rounded-md bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-sm border border-outline-variant disabled:opacity-40"
            >
              Previous
            </button>
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
