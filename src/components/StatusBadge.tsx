import type { ComplianceStatus, ReviewStatus } from '../types';

const complianceStyles: Record<ComplianceStatus, string> = {
  ACHIEVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PARTIALLY_ACHIEVED: 'bg-amber-50 text-amber-700 border-amber-200',
  NOT_ACHIEVED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const complianceLabels: Record<ComplianceStatus, string> = {
  ACHIEVED: 'Achieved',
  PARTIALLY_ACHIEVED: 'Partially Achieved',
  NOT_ACHIEVED: 'Not Achieved',
};

const reviewStyles: Record<ReviewStatus, string> = {
  PENDING: 'bg-slate-100 text-slate-600 border-slate-300',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
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
