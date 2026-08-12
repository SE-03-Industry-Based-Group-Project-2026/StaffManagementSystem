import React from 'react';
import AppIcon from '../components/AppIcon';

export function PageHero({ icon, title, subtitle, action }) {
  return (
    <div className="page-hero">
      <div className="page-title">
        <div className="icon-box"><AppIcon name={icon} size={23} /></div>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {note && <div className="stat-note">{note}</div>}
      </div>
      <div className="icon-box"><AppIcon name={icon} size={22} /></div>
    </div>
  );
}

export function EmptyState({ icon='search', title='No data found', text='There is nothing to display yet.' }) {
  return (
    <div className="empty">
      <AppIcon name={icon} size={42} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export const statusBadge = (status, displayText = status) => {
  const normalized = String(status || '').toLowerCase();

  let className = 'badge-neutral';

  if (normalized === 'open') {
    className = 'badge-danger';
  } else if (normalized === 'in progress') {
    className = 'badge-warning';
  } else if (normalized === 'resolved') {
    className = 'badge-success';
  } else if (normalized === 'closed') {
    className = 'badge-neutral';
  }

  return (
    <span className={`badge ${className}`}>
      {displayText}
    </span>
  );
};
