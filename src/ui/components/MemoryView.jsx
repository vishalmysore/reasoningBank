/**
 * MemoryView.jsx — Display all stored ReasoningBank memories
 */
import React, { useState } from 'react';
import { deleteMemory, clearMemories } from '../../memory/memoryStore.js';

function ConfidenceBadge({ value }) {
  const pct = Math.round(value * 100);
  const cls = value >= 0.8 ? 'conf-high' : value >= 0.6 ? 'conf-medium' : 'conf-low';
  return <div className={`conf-ring ${cls}`} style={{ width: 36, height: 36, fontSize: 10 }}>{pct}%</div>;
}

function MemoryCard({ memory, onDelete, index }) {
  const [expanded, setExpanded] = useState(false);
  const age = Math.round((Date.now() - memory.timestamp) / 60000);
  const ageLabel = age < 60 ? `${age}m ago`
    : age < 1440 ? `${Math.round(age / 60)}h ago`
    : `${Math.round(age / 1440)}d ago`;

  return (
    <div className="memory-card glass slide-in"
      style={{ padding: '14px 16px', animationDelay: `${index * 0.04}s`, cursor: 'pointer' }}
      onClick={() => setExpanded(e => !e)}>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <ConfidenceBadge value={memory.confidence} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, color: 'var(--text-primary)' }}>
              {memory.title}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              {memory.usageCount > 0 && (
                <span className="tag tag-purple" style={{ fontSize: 10 }}>
                  ↩ used {memory.usageCount}×
                </span>
              )}
              <button
                id={`delete-memory-${memory.id}`}
                onClick={(e) => { e.stopPropagation(); onDelete(memory.id); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: 14, padding: '2px 4px',
                  borderRadius: 4, transition: 'var(--transition)',
                }}
                title="Delete memory"
                onMouseEnter={e => e.target.style.color = 'var(--accent-red)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                ✕
              </button>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.5 }}>
            {memory.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {memory.tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="tag tag-blue" style={{ fontSize: 10 }}>#{tag}</span>
            ))}
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{ageLabel}</span>
          </div>
        </div>
      </div>

      {expanded && memory.content?.length > 0 && (
        <div className="fade-in" style={{
          marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          {memory.content.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MemoryView({ memories, onMemoriesChange }) {
  const [search, setSearch] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = memories.filter(m => {
    const q = search.toLowerCase();
    return !q
      || m.title.toLowerCase().includes(q)
      || m.description.toLowerCase().includes(q)
      || m.tags.some(t => t.includes(q))
      || m.content.some(c => c.toLowerCase().includes(q));
  });

  const handleDelete = async (id) => {
    await deleteMemory(id);
    onMemoriesChange();
  };

  const handleClearAll = async () => {
    await clearMemories();
    onMemoriesChange();
    setConfirmClear(false);
  };

  return (
    <div className="glass memory-panel" style={{ padding: '20px 22px' }}>
      {/* Header */}
      <div className="section-header">
        <div className="section-icon" style={{ background: 'rgba(167,139,250,0.15)', fontSize: 20 }}>🧠</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>
            ReasoningBank Memory
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
            {memories.length} lesson{memories.length !== 1 ? 's' : ''} accumulated
          </p>
        </div>
        {memories.length > 0 && (
          <div className="badge">{memories.length}</div>
        )}
      </div>

      {memories.length > 0 && (
        <>
          {/* Search */}
          <input
            id="memory-search"
            type="text"
            placeholder="🔍 Search memories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 12, fontSize: 13 }}
          />

          {/* Progress: memory bank fullness */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Bank capacity</span>
              <span>{memories.length} / 50</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(memories.length / 50 * 100, 100)}%` }} />
            </div>
          </div>
        </>
      )}

      {/* Memory list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
        {filtered.length > 0 ? (
          filtered.map((m, i) => (
            <MemoryCard key={m.id} memory={m} onDelete={handleDelete} index={i} />
          ))
        ) : memories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏦</div>
            <div style={{ fontSize: 13 }}>No memories yet.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Generate your first trip to start learning.</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            No memories match "{search}"
          </div>
        )}
      </div>

      {/* Clear all */}
      {memories.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          {confirmClear ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>
                Delete all {memories.length} memories?
              </span>
              <button id="confirm-clear-btn" className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12 }}
                onClick={handleClearAll}>Yes, Clear</button>
              <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}
                onClick={() => setConfirmClear(false)}>Cancel</button>
            </div>
          ) : (
            <button id="clear-memory-btn" className="btn btn-ghost"
              style={{ width: '100%', fontSize: 12, color: 'var(--text-muted)' }}
              onClick={() => setConfirmClear(true)}>
              🗑️ Clear All Memories
            </button>
          )}
        </div>
      )}
    </div>
  );
}
