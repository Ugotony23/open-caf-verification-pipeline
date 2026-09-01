import type { ComplianceStatus, ReviewStatus } from '../types';

const complianceStyles: Record<ComplianceStatus, string> = {
  ACHIEVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  PARTIALLY_ACHIEVED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  NOT_ACHIEVED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

const complianceLabels: Record<ComplianceStatus, string> = {
  ACHIEVED: 'Achieved',
  PARTIALLY_ACHIEVED: 'Partially Achieved',
  NOT_ACHIEVED: 'Not Achieved',
};

const reviewStyles: Record<ReviewStatus, string> = {
  PENDING: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

export function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${complianceStyles[status]}`}>
      {complianceLabels[status]}
    </span>
  );
}

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${reviewStyles[status]}`}>
      {status[0] + status.slice(1).toLowerCase()}
    </span>
  );
}
