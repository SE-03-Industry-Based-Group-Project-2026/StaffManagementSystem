import React from 'react';
import AppIcon from './AppIcon';
import { formatSriLankaDateTime } from '../utils/dateTime';

export default function LeaveTimeline({ request, t, tr, lang }) {
  const isLabourer = String(request.users?.staff_category || '').toLowerCase() === 'labour' || 
                     String(request.users?.designations?.designation_en || '').toLowerCase().includes('labour') ||
                     String(request.users?.designations?.designation_si || '').includes('කම්කරු') ||
                     String(request.users?.designations?.designation_ta || '').includes('தொழிலாளி');

  const steps = isLabourer
    ? [
        { key: 'submitted', label: tr('submitted', 'Submitted'), note: tr('leave_submitted', 'Leave request submitted'), date: request.created_at, done: true },
        { key: 'chairman-approved', label: tr('chairman_approved', 'Chairman Approved'), note: tr('chairman_approval_note', 'Final approval by the Chairman'), date: request.final_approved_at, done: request.status === 'Approved' }
      ]
    : [
        { key: 'submitted', label: tr('submitted', 'Submitted'), note: tr('leave_submitted', 'Leave request submitted'), date: request.created_at, done: true },
        { key: 'subject-approved', label: tr('subject_officer_approved', 'Subject Officer Approved'), note: tr('waiting_cc_officer', 'Forwarded to the CC Officer'), date: request.admin_approved_at, done: Boolean(request.admin_approved_at) },
        { key: 'cc-approved', label: tr('cc_officer_approved', 'CC Officer Approved'), note: tr('waiting_secretary', 'Forwarded to the Secretary'), date: request.cc_approved_at, done: Boolean(request.cc_approved_at) },
        { key: 'secretary-approved', label: tr('secretary_approved', 'Secretary Approved'), note: tr('final_approval', 'Final approval completed'), date: request.final_approved_at, done: request.status === 'Approved' }
      ];

  if (request.status === 'Rejected') {
    steps.push({
      key: 'rejected',
      label: tr('rejected', 'Rejected'),
      note: request.supervisor_remark || tr('leave_rejected', 'Leave request rejected'),
      date: request.updated_at,
      done: true,
      rejected: true
    });
  }

  return (
    <div className="pro-card leave-timeline-card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <h3>{tr('approval_timeline', 'Approval Timeline')}</h3>
      </div>
      <div className="leave-timeline">
        {steps.map((step, index) => (
          <div key={step.key} className={`timeline-step ${step.done ? 'done' : ''} ${step.rejected ? 'rejected' : ''}`}>
            <div className="timeline-dot">
              {step.done ? (step.rejected ? <AppIcon name="x" size={15} /> : <AppIcon name="check" size={15} />) : (index + 1)}
            </div>
            <div className="timeline-content">
              <strong>{step.label}</strong>
              <span>{step.note}</span>
              <small style={{ display: 'block', marginTop: 5, color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                {step.date ? formatSriLankaDateTime(step.date) : tr('not_completed_yet', 'Not completed yet')}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}