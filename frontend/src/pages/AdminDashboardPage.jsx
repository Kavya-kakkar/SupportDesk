import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  Bolt,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Plus,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [range]);

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-on-surface-variant font-body-md">
        Aggregating live telemetry and queue metrics...
      </div>
    );
  }

  const { telemetry, byPriority, byStatus, volumeTrend, escalations } = data;

  const totalTickets = telemetry.totalTickets || 1; // avoid / 0

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Editorial Header */}
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-sm text-label-sm uppercase text-primary tracking-wider font-semibold">
              Operations Console
            </span>
            <span className="text-outline-variant">/</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Live Telemetry
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Support Overview</h1>
        </div>

        <div className="flex items-center gap-space-sm">
          <div className="flex items-center bg-surface-container-lowest rounded-lg p-space-xs shadow-sm border border-outline-variant">
            {['7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-space-md py-space-xs rounded font-label-md text-label-md uppercase transition-colors ${
                  range === r
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Link
            to="/tickets/new"
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-secondary transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Ticket</span>
          </Link>
        </div>
      </div>

      {/* 4 Telemetry Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Open Tickets */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex flex-col justify-between gap-space-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              Open Tickets
            </span>
            <span className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant">
              <Ticket className="w-4 h-4 text-primary" />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-space-sm">
            <span className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
              {telemetry.openTickets}
            </span>
            <span className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{telemetry.urgentTickets} Urgent</span>
            </span>
          </div>
        </div>

        {/* Avg First Response */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex flex-col justify-between gap-space-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              Avg. First Response
            </span>
            <span className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant">
              <Bolt className="w-4 h-4 text-secondary" />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-space-sm">
            <span className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
              {telemetry.avgFirstResponseTime}
            </span>
            <span className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
              <TrendingDown className="w-3.5 h-3.5 text-primary" />
              <span>-12% vs target</span>
            </span>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex flex-col justify-between gap-space-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              SLA Compliance
            </span>
            <span className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-space-sm">
            <span className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
              {telemetry.slaCompliance}%
            </span>
            <span className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+0.6%</span>
            </span>
          </div>
        </div>

        {/* Resolved Today */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex flex-col justify-between gap-space-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              Resolved Today
            </span>
            <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
              <CheckCircle className="w-4 h-4 text-primary" />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-space-sm">
            <span className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
              {telemetry.resolvedToday}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Total {telemetry.resolvedTickets} Resolved
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Ticket Volume & Resolution Trend (7 col) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant flex flex-col justify-between gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex flex-col gap-space-xs">
              <h2 className="font-title-md text-title-md text-on-surface">
                Ticket Volume &amp; Resolution Trend
              </h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Daily incoming volume vs. resolved tickets
              </span>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Incoming</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-fixed-dim" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Resolved</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart with Real DB Counts */}
          <div className="w-full h-56 relative pt-4">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 640 180"
              role="img"
              aria-label="Ticket Volume Trend Chart"
            >
              {/* Horizontal Gridlines */}
              <g className="text-surface-container-high" stroke="currentColor" strokeDasharray="3 3" strokeWidth="1">
                <line x1="32" x2="624" y1="20" y2="20" />
                <line x1="32" x2="624" y1="65" y2="65" />
                <line x1="32" x2="624" y1="110" y2="110" />
                <line x1="32" x2="624" y1="155" y2="155" />
              </g>

              {/* Data Bars */}
              {volumeTrend.map((item, idx) => {
                const xBase = 50 + idx * 80;
                const incHeight = Math.min(130, Math.max(12, item.incoming * 22));
                const resHeight = Math.min(130, Math.max(8, item.resolved * 22));

                return (
                  <g key={item.date}>
                    {/* Incoming Bar (Primary Indigo) */}
                    <rect
                      x={xBase}
                      y={155 - incHeight}
                      width="16"
                      height={incHeight}
                      rx="3"
                      className="text-primary fill-current"
                    />
                    {/* Resolved Bar (Lavender Light) */}
                    <rect
                      x={xBase + 18}
                      y={155 - resHeight}
                      width="16"
                      height={resHeight}
                      rx="3"
                      className="text-primary-fixed-dim fill-current"
                    />
                    {/* Day label */}
                    <text
                      x={xBase + 16}
                      y="172"
                      textAnchor="middle"
                      className="text-on-surface-variant font-label-sm text-[11px] fill-current"
                    >
                      {item.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Priority & Status Distribution (5 col) */}
        <div className="lg:col-span-5 flex flex-col gap-gutter">
          {/* Priority Breakdown */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex flex-col gap-3">
            <h2 className="font-title-md text-title-md text-on-surface">Tickets by Priority</h2>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Urgent', count: byPriority.urgent, color: 'bg-error', text: 'text-error' },
                { label: 'High', count: byPriority.high, color: 'bg-tertiary-container', text: 'text-tertiary' },
                { label: 'Medium', count: byPriority.medium, color: 'bg-primary-container', text: 'text-primary' },
                { label: 'Low', count: byPriority.low, color: 'bg-outline', text: 'text-outline' },
              ].map((p) => {
                const pct = Math.round((p.count / totalTickets) * 100);
                return (
                  <div key={p.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between font-label-md text-label-md">
                      <span className={`font-medium ${p.text}`}>{p.label}</span>
                      <span className="text-on-surface font-semibold">{p.count} tickets ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className={`h-full ${p.color} rounded-full`} style={{ width: `${Math.max(4, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant flex flex-col gap-3">
            <h2 className="font-title-md text-title-md text-on-surface">Status Distribution</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Open</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">{byStatus.open}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">In Progress</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">{byStatus.in_progress}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Resolved</span>
                <span className="font-headline-sm text-headline-sm text-[#059669]">{byStatus.resolved}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Closed</span>
                <span className="font-headline-sm text-headline-sm text-on-surface-variant">{byStatus.closed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Escalations & High-Priority Queue Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
        <div className="p-space-md border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error" />
            <h2 className="font-title-md text-title-md text-on-surface">
              Recent Escalations &amp; High-Priority Queue
            </h2>
          </div>
          <Link
            to="/admin/tickets?priority=urgent"
            className="text-primary font-label-md text-label-md hover:underline font-medium"
          >
            View all priority tickets →
          </Link>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase font-semibold">
                <th className="py-2.5 px-4">Ticket ID</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Requester</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Assignee</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {escalations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant text-body-sm">
                    No urgent or high priority escalations in queue. All systems operating within SLA.
                  </td>
                </tr>
              ) : (
                escalations.map((esc) => (
                  <tr
                    key={esc._id}
                    className="hover:bg-surface-container-low/60 transition-colors border-t border-outline-variant"
                  >
                    <td className="py-3 px-4 font-title-sm text-title-sm text-primary font-semibold whitespace-nowrap">
                      <Link to={`/tickets/${esc._id}`}>{esc.ticketId}</Link>
                    </td>
                    <td className="py-3 px-4 font-body-md text-body-md text-on-surface max-w-sm truncate">
                      <Link to={`/tickets/${esc._id}`} className="hover:text-primary transition-colors">
                        {esc.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                      {esc.createdBy?.name || 'Customer'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={esc.status} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={esc.priority} />
                    </td>
                    <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                      {esc.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/tickets/${esc._id}`}
                        className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary transition-colors inline-block"
                      >
                        Triage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
