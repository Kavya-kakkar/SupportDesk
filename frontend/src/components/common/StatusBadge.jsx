import React from 'react';

const statusConfig = {
  open: {
    label: 'Open',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-primary-fixed text-on-primary-fixed',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-[#D1FAE5] text-[#059669]',
  },
  closed: {
    label: 'Closed',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
};

export default function StatusBadge({ status }) {
  const normalized = (status || 'open').toLowerCase().replace(' ', '_');
  const config = statusConfig[normalized] || statusConfig.open;

  return (
    <span
      className={`inline-flex items-center px-space-sm py-space-xs rounded-full font-label-md text-label-md capitalize whitespace-nowrap ${config.className}`}
    >
      {config.label}
    </span>
  );
}
