/**
 * ItineraryView.jsx — Display generated itinerary, reasoning, and execution steps
 */
import React, { useState } from 'react';

function StepLog({ steps }) {
  if (!steps?.length) return null;
  return (
    <div className="step-log glass" style={{ marginBottom: 20, padding: '14px 18px' }}>
      <div className="section-header" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>⚙️</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
          Agent Execution Log
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {steps.map((step, i) => (
          <div key={i} className="slide-in" style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            animationDelay: `${i * 0.05}s`,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--accent-primary)',
              background: 'rgba(96,165,250,0.12)', borderRadius: 4,
              padding: '2px 6px', marginTop: 1, flexShrink: 0,
            }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoryInfluence({ memories }) {
  if (!memories?.length) return (
    <div style={{
      padding: '10px 16px', borderRadius: 8, marginBottom: 16,
      background: 'rgba(75,85,99,0.15)', border: '1px solid rgba(75,85,99,0.3)',
      fontSize: 13, color: 'var(--text-muted)',
    }}>
      📭 No past memories used — this is a baseline plan.
    </div>
  );
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 8, marginBottom: 16,
      background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 8, letterSpacing: '0.05em' }}>
        🧠 MEMORY INFLUENCE — {memories.length} past lesson(s) applied
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {memories.map((m, i) => (
          <span key={i} className="tag tag-green">
            {m.title.length > 30 ? m.title.slice(0, 30) + '…' : m.title}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ItineraryView({ result, isLoading, currentStep }) {
  const [tab, setTab] = useState('itinerary');

  if (isLoading) {
    return (
      <div className="glass itinerary-panel fade-in" style={{ padding: 28 }}>
        <div className="section-header">
          <div className="section-icon" style={{ background: 'rgba(167,139,250,0.15)' }}>🤖</div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
              Agent Running…
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              ReasoningBank loop in progress
            </p>
          </div>
        </div>
        <div className="divider" />
        {currentStep && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 18px', borderRadius: 10,
            background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}>
            <span className="spinner" />
            <span style={{ fontSize: 14, color: 'var(--accent-primary)' }}>{currentStep}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexDirection: 'column' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              height: 14, borderRadius: 6,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
              backgroundSize: '500px 100%',
              animation: 'shimmer 1.5s infinite',
              width: i === 3 ? '60%' : '100%',
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass itinerary-panel" style={{
        padding: 48, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 300, textAlign: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 56 }}>🗺️</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>
          Your itinerary will appear here
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.7 }}>
          Fill in the travel details and click <strong>Generate Itinerary</strong>.
          The agent will retrieve past memories and plan smarter every time.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          {['🔍 Memory Retrieval', '✈️ AI Planning', '🧠 Reflection', '💡 Learning'].map((f, i) => (
            <span key={i} className="tag tag-blue">{f}</span>
          ))}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'itinerary', label: '📋 Itinerary' },
    { id: 'reasoning', label: '💭 Reasoning' },
    { id: 'log',       label: '⚙️ Agent Log' },
  ];

  return (
    <div className="glass itinerary-panel fade-in">
      {/* Header */}
      <div style={{ padding: '20px 24px 0' }}>
        <div className="section-header">
          <div className="section-icon" style={{ background: 'rgba(96,165,250,0.15)' }}>📋</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
              Travel Itinerary
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Generated with ReasoningBank memory system
            </p>
          </div>
        </div>

        <MemoryInfluence memories={result.memoriesUsed} />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              color: tab === t.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: tab === t.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: 'var(--transition)',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '20px 24px 24px' }}>
        {tab === 'itinerary' && (
          <div className="fade-in" style={{
            whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)',
            fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)',
          }}>
            {result.itinerary}
          </div>
        )}

        {tab === 'reasoning' && (
          <div className="fade-in">
            {result.reasoning ? (
              <div style={{
                whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8,
                color: 'var(--text-secondary)',
              }}>
                {result.reasoning}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No reasoning captured.</p>
            )}
            {result.assumptions?.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
                  letterSpacing: '0.06em', marginBottom: 10 }}>ASSUMPTIONS</div>
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.assumptions.map((a, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === 'log' && (
          <div className="fade-in">
            <StepLog steps={result.steps} />
          </div>
        )}
      </div>
    </div>
  );
}
