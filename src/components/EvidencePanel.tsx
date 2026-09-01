import { useEffect, useState } from 'react';
import { Loader2, Trash2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import type { Evidence, Objective } from '../types';

export function EvidencePanel() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [framework, setFramework] = useState<Objective[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [outcomeByEvidence, setOutcomeByEvidence] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  function refresh() {
    api.listEvidence().then(setEvidence).catch((e) => setError(e.message));
  }

  useEffect(() => {
    refresh();
    api.getFramework().then(setFramework).catch((e) => setError(e.message));
  }, []);

  const outcomes = framework.flatMap((o) =>
    o.principles.flatMap((p) => p.outcomes.map((oc) => ({ ...oc, label: `${o.id} > ${p.id} ${p.name} > ${oc.id} ${oc.name}` }))),
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim()) return;
    try {
      await api.createEvidence({ title, content });
      setTitle('');
      setContent('');
      refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteEvidence(id);
      refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleAnalyze(id: string) {
    const outcomeId = outcomeByEvidence[id];
    if (!outcomeId) {
      setError('Select a contributing outcome to analyze against first.');
      return;
    }
    setError(null);
    setMessage(null);
    setAnalyzingId(id);
    try {
      const created = await api.analyzeEvidence(id, outcomeId);
      setMessage(`Created ${created.length} mapping(s). Check the Review Queue.`);
      refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalyzingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Evidence</h2>
        <p className="text-sm text-slate-500">Upload policy or operational evidence and run it against CAF outcomes.</p>
      </div>

      <form onSubmit={handleCreate} className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Evidence title (e.g. Access Control Policy v2)"
          className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste the evidence content..."
          rows={4}
          className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2"
        >
          Add Evidence
        </button>
      </form>

      {error && <p className="text-sm text-rose-400">{error}</p>}
      {message && <p className="text-sm text-emerald-400">{message}</p>}

      <div className="space-y-3">
        {evidence.length === 0 && <p className="text-sm text-slate-500">No evidence submitted yet.</p>}
        {evidence.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.content}</p>
                <p className="text-xs text-slate-600 mt-2">
                  {item._count?.mappings ?? 0} mapping(s) · added {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-slate-600 hover:text-rose-400">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <select
                value={outcomeByEvidence[item.id] ?? ''}
                onChange={(e) => setOutcomeByEvidence((s) => ({ ...s, [item.id]: e.target.value }))}
                className="flex-1 rounded-md bg-slate-950 border border-slate-800 px-2 py-1.5 text-xs text-slate-200"
              >
                <option value="">Select contributing outcome...</option>
                {outcomes.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAnalyze(item.id)}
                disabled={analyzingId === item.id}
                className="flex items-center gap-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 text-xs font-medium px-3 py-1.5"
              >
                {analyzingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Analyze
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
