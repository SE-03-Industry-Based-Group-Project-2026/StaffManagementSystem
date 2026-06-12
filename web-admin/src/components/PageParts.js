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

export function statusBadge(status) {
  const s = String(status || '').toLowerCase();
  let cls = 'badge-neutral';
  if (s.includes('approved') || s.includes('active') || s.includes('resolved') || s.includes('present')) cls = 'badge-success';
  if (s.includes('pending') || s.includes('progress') || s.includes('late') || s.includes('admin')) cls = 'badge-warning';
  if (s.includes('reject') || s.includes('inactive') || s.includes('open') || s.includes('absent')) cls = 'badge-danger';
  return <span className={`badge ${cls}`}>{status || 'N/A'}</span>;
}
