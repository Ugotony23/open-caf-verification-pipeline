export type ComplianceStatus = 'ACHIEVED' | 'PARTIALLY_ACHIEVED' | 'NOT_ACHIEVED';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IGP {
  id: string;
  outcomeId: string;
  statement: string;
}

export interface Outcome {
  id: string;
  principleId: string;
  name: string;
  description: string;
  igps: IGP[];
}

export interface Principle {
  id: string;
  objectiveId: string;
  name: string;
  description: string;
  outcomes: Outcome[];
}

export interface Objective {
  id: string;
  name: string;
  description: string;
  principles: Principle[];
}

export interface Evidence {
  id: string;
  title: string;
  content: string;
  sourceType: string;
  createdAt: string;
  _count?: { mappings: number };
}

export interface MappingIgp extends IGP {
  outcome: Outcome & { principle: Principle & { objective: Objective } };
}

export interface Mapping {
  id: string;
  evidenceId: string;
  evidence: Evidence;
  igpId: string;
  igp: MappingIgp;
  status: ComplianceStatus;
  confidence: number;
  aiReasoning: string;
  reviewStatus: ReviewStatus;
  reviewerNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  mappingId: string;
  action: string;
  actor: string;
  details: string | null;
  createdAt: string;
}

export interface DashboardStats {
  evidenceCount: number;
  mappingCount: number;
  pendingCount: number;
  byStatus: { status: ComplianceStatus; count: number }[];
}
