import { useEffect, useState } from 'react';
import {
  Search,
  Trash2,
  Download,
  Filter,
  Calendar,
  FileText,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getAnalyses, deleteAnalysis, deleteAnalyses } from '../utils/storage';
import { getSession } from '../auth';
import { generatePdfReport, exportJson, exportTxt } from '../utils/report';
import clsx from 'clsx';

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [classification, setClassification] = useState('');
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const user = getSession();
      if (!user) {
        setError('Not signed in');
        setItems([]);
        return;
      }
      let list = getAnalyses(user.id).map((a) => ({ ...a, _id: a.id }));

      if (query.trim()) {
        const q = query.trim().toLowerCase();
        list = list.filter(
          (a) =>
            (a.fileName || '').toLowerCase().includes(q) ||
            (a.snippet || '').toLowerCase().includes(q) ||
            (a.summary || '').toLowerCase().includes(q)
        );
      }
      if (classification === 'ai') list = list.filter((a) => (a.aiScore ?? 0) >= 65);
      else if (classification === 'human') list = list.filter((a) => (a.humanScore ?? 0) >= 65);
      else if (classification === 'mixed') {
        list = list.filter((a) => (a.aiScore ?? 0) < 65 && (a.humanScore ?? 0) < 65);
      }

      if (sort === 'oldest') list = [...list].reverse();
      else if (sort === 'ai-high') list = [...list].sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
      else if (sort === 'ai-low') list = [...list].sort((a, b) => (a.aiScore ?? 0) - (b.aiScore ?? 0));

      setItems(list);
      setSelected(new Set());
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [classification, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i._id)));
  };

  const deleteOne = async (id) => {
    if (!confirm('Delete this analysis?')) return;
    try {
      const user = getSession();
      if (!user) return;
      deleteAnalysis(id, user.id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected analyses?`)) return;
    setDeleting(true);
    try {
      const user = getSession();
      if (!user) return;
      deleteAnalyses(Array.from(selected), user.id);
      setItems((prev) => prev.filter((i) => !selected.has(i._id)));
      setSelected(new Set());
    } catch (err) {
      alert(err.message || 'Bulk delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              className="input pl-9"
              placeholder="Search by name or content…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
          >
            <option value="">All classifications</option>
            <option value="ai">AI-like</option>
            <option value="human">Human-like</option>
            <option value="mixed">Mixed</option>
          </select>
          <select
            className="input w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <button type="submit" className="btn-primary">
            <Filter size={16} /> Filter
          </button>
        </form>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-1">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {selected.size} selected
          </span>
          <button className="btn-danger text-xs py-1.5" onClick={bulkDelete} disabled={deleting}>
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete selected
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4">
              <div className="skeleton h-5 w-48 mb-2" />
              <div className="skeleton h-4 w-32" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-2" style={{ color: 'var(--danger)' }} />
          <p style={{ color: 'var(--danger)' }}>{error}</p>
          <button className="btn-primary mt-3" onClick={load}>
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
            No analyses found
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {query || classification ? 'Try different filters' : 'Run your first analysis to see history here'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selected.size === items.length && items.length > 0}
                onChange={toggleAll}
                className="rounded"
              />
            </div>
            <div className="col-span-4">Document</div>
            <div className="col-span-2">AI / Human</div>
            <div className="col-span-2">Words</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Actions</div>
          </div>

          {items.map((item) => {
            const cls =
              item.aiScore >= 65 ? 'ai' : item.humanScore >= 65 ? 'human' : 'mixed';
            return (
              <div
                key={item._id}
                className="card p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center hover:shadow-soft transition"
              >
                <div className="md:col-span-1 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(item._id)}
                    onChange={() => toggleSelect(item._id)}
                    className="rounded"
                  />
                  <div
                    className={clsx(
                      'md:hidden badge',
                      cls === 'ai' && 'badge-ai',
                      cls === 'human' && 'badge-human',
                      cls === 'mixed' && 'badge-mixed'
                    )}
                  >
                    {item.aiScore}% AI
                  </div>
                </div>
                <div className="md:col-span-4 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {item.fileName}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {item.summary}
                  </p>
                </div>
                <div className="md:col-span-2 hidden md:flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
                    {item.aiScore}%
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>/</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
                    {item.humanScore}%
                  </span>
                </div>
                <div className="md:col-span-2 text-sm hidden md:block" style={{ color: 'var(--text-secondary)' }}>
                  {item.wordCount?.toLocaleString()} words
                </div>
                <div className="md:col-span-2 text-sm hidden md:block" style={{ color: 'var(--text-muted)' }}>
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="md:col-span-1 flex items-center gap-1">
                  <button
                    className="btn-ghost p-1.5"
                    title="Download PDF"
                    onClick={() => generatePdfReport(item)}
                  >
                    <Download size={15} />
                  </button>
                  <button
                    className="btn-ghost p-1.5"
                    title="Delete"
                    onClick={() => deleteOne(item._id)}
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
