import React from 'react';

const priorityConfig = {
  urgent: {
    label: 'Urgent',
    containerClass: 'bg-error-container text-on-error-container',
    dotClass: 'bg-error',
  },
  high: {
    label: 'High',
    containerClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    dotClass: 'bg-tertiary-container',
  },
  medium: {
    label: 'Medium',
    containerClass: 'bg-primary-fixed text-on-primary-fixed',
    dotClass: 'bg-primary-container',
  },
  low: {
    label: 'Low',
    containerClass: 'bg-surface-container-high text-on-surface-variant',
    dotClass: 'bg-outline',
  },
};

export default function PriorityBadge({ priority }) {
  const normalized = (priority || 'medium').toLowerCase();
  const config = priorityConfig[normalized] || priorityConfig.medium;

  return (
    <span
      className={`inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full font-label-md text-label-md capitalize whitespace-nowrap ${config.containerClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}
