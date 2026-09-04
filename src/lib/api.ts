import type {
  AuditLogEntry,
  DashboardStats,
  Evidence,
  Mapping,
  Objective,
} from '../types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ id: string; email: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string) =>
    request<{ id: string; email: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  me: () => request<{ id: string; email: string }>('/auth/me'),

  getFramework: () => request<Objective[]>('/framework'),

  listEvidence: () => request<Evidence[]>('/evidence'),
  createEvidence: (data: { title: string; content: string; sourceType?: string }) =>
    request<Evidence>('/evidence', { method: 'POST', body: JSON.stringify(data) }),
  deleteEvidence: (id: string) => request<void>(`/evidence/${id}`, { method: 'DELETE' }),

  analyzeEvidence: (id: string, outcomeId: string) =>
    request<Mapping[]>(`/evidence/${id}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ outcomeId }),
    }),

  listMappings: (reviewStatus?: string) =>
    request<Mapping[]>(`/mappings${reviewStatus ? `?reviewStatus=${reviewStatus}` : ''}`),
  reviewMapping: (id: string, decision: 'APPROVED' | 'REJECTED', reviewerNotes?: string) =>
    request<Mapping>(`/mappings/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, reviewerNotes }),
    }),
  getAuditLog: (mappingId: string) => request<AuditLogEntry[]>(`/mappings/${mappingId}/audit-log`),

  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),
};
