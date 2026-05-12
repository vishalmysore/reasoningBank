/**
 * App.jsx — Main application shell
 * Wires together: InputPanel, ItineraryView, MemoryView, LessonView, SettingsModal
 */
import React, { useState, useEffect, useCallback } from 'react';
import InputPanel      from './components/InputPanel.jsx';
import ItineraryView   from './components/ItineraryView.jsx';
import MemoryView      from './components/MemoryView.jsx';
import LessonView      from './components/LessonView.jsx';
import SettingsModal   from './components/SettingsModal.jsx';
import { runTrip }     from '../agent/travelAgent.js';
import './App.css';
import { getAllMemories } from '../memory/memoryStore.js';
import { getLLMConfig, PROVIDERS } from '../utils/llm.js';

// ── Hero header ──────────────────────────────────────────────
function Header({ memCount, onSettings, configVersion }) {
  // Re-reads config on every configVersion bump
  const cfg = getLLMConfig();
  const isConfigured = Boolean(cfg.apiKey) || cfg.provider === 'mock';
  const providerInfo = PROVIDERS.find(p => p.id === cfg.provider);
  const isDefaultProxy = cfg.proxyUrl === 'https://rough-tree-aee4.vishalmysore.workers.dev';

  return (
    <header style={{
      padding: '0 24px',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(5,7,15,0.9)',
      backdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', gap: 14, height: 60,
      flexWrap: 'wrap',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 180 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'var(--gradient-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, boxShadow: '0 0 14px rgba(96,165,250,0.35)', flexShrink: 0,
        }}>🏦</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
            background: 'var(--gradient-accent)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>ReasoningBank</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: -1 }}>
            AI Travel Agent · Self-Improving Memory
          </div>
        </div>
      </div>

      {/* Memory count pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px',
        borderRadius: 999, background: 'rgba(167,139,250,0.1)',
        border: '1px solid rgba(167,139,250,0.2)',
        fontSize: 11, fontWeight: 600, color: '#c4b5fd', flexShrink: 0,
      }}>
        🧠 {memCount} {memCount === 1 ? 'memory' : 'memories'}
      </div>

      {/* Active provider badge */}
      {isConfigured && providerInfo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px',
          borderRadius: 999, background: 'rgba(96,165,250,0.08)',
          border: '1px solid rgba(96,165,250,0.2)',
          fontSize: 11, fontWeight: 600, color: 'var(--accent-primary)', flexShrink: 0,
        }}>
          {providerInfo.icon} {providerInfo.name}
          <span style={{ opacity: 0.5, margin: '0 2px' }}>·</span>
          <span style={{ opacity: 0.8 }}>{cfg.model.split('/').pop().slice(0, 16)}</span>
        </div>
      )}

      {/* Proxy status */}
      <div title={`Proxy: ${cfg.proxyUrl}`} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600, flexShrink: 0,
        color: isConfigured ? 'var(--accent-green)' : 'var(--accent-gold)',
        cursor: 'default',
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: isConfigured ? 'var(--accent-green)' : 'var(--accent-gold)',
          boxShadow: `0 0 6px ${isConfigured ? 'var(--accent-green)' : 'var(--accent-gold)'}`,
        }} />
        {isConfigured
          ? `${cfg.provider === 'mock' ? 'Mock Mode' : 'Ready'} · ${isDefaultProxy ? 'Default Proxy' : 'Custom Proxy'}`
          : 'API Key Needed'}
      </div>

      {/* Settings button */}
      <button id="open-settings-btn" className="btn btn-ghost"
        style={{ padding: '6px 14px', fontSize: 13, flexShrink: 0 }} onClick={onSettings}>
        ⚙️ Settings
      </button>
    </header>
  );
}

// ── Hero section ─────────────────────────────────────────────
function HeroBanner() {
  return (
    <div style={{
      background: 'var(--gradient-hero)',
      borderBottom: '1px solid var(--border)',
      padding: '40px 28px 36px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative orbs */}
      {['rgba(96,165,250,0.12)', 'rgba(167,139,250,0.1)'].map((c, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: i === 0 ? 400 : 300,
          height: i === 0 ? 400 : 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c}, transparent 70%)`,
          top: i === 0 ? -100 : 'auto',
          bottom: i === 1 ? -80 : 'auto',
          right: i === 0 ? -100 : 'auto',
          left: i === 1 ? -80 : 'auto',
          pointerEvents: 'none',
        }} />
      ))}

      <div style={{ position: 'relative', maxWidth: 680 }}>
        <div className="tag tag-purple" style={{ marginBottom: 14 }}>
          🔬 Google Research Concept · Browser-Only
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 42px)',
          fontWeight: 800, lineHeight: 1.2, marginBottom: 14,
        }}>
          An AI Travel Agent that{' '}
          <span className="glow-text">Learns from Every Trip</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, maxWidth: 560 }}>
          ReasoningBank stores structured experiences — not raw logs.
          Every trip generates a <strong style={{ color: 'var(--text-primary)' }}>reusable lesson</strong> that
          automatically improves future plans, entirely in your browser.
        </p>

        <div style={{ display: 'flex', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
          {[
            { icon: '🔍', label: 'Memory Retrieval' },
            { icon: '✈️', label: 'LLM Planning' },
            { icon: '🧠', label: 'Reflection Engine' },
            { icon: '💡', label: 'Self-Improvement' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Error toast ───────────────────────────────────────────────
function ErrorToast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fade-in" style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.35)',
      backdropFilter: 'blur(12px)', borderRadius: 12,
      padding: '14px 20px', zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 12,
      maxWidth: 520, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <span style={{ fontSize: 18 }}>⚠️</span>
      <span style={{ fontSize: 13, color: '#fca5a5', flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', fontSize: 16,
      }}>✕</button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [memories,      setMemories]     = useState([]);
  const [result,        setResult]       = useState(null);
  const [isLoading,     setIsLoading]    = useState(false);
  const [currentStep,   setCurrentStep]  = useState('');
  const [error,         setError]        = useState('');
  const [showSettings,  setShowSettings] = useState(false);
  // Bump this to force Header to re-read getLLMConfig() after settings save
  const [configVersion, setConfigVersion] = useState(0);

  // Refresh memory list from IndexedDB
  const refreshMemories = useCallback(() => {
    getAllMemories().then(setMemories);
  }, []);

  // Load memories from IndexedDB on mount
  useEffect(() => { refreshMemories(); }, [refreshMemories]);

  // Auto-prompt settings on first visit
  useEffect(() => {
    const cfg = getLLMConfig();
    if (!cfg.apiKey) {
      const timer = setTimeout(() => setShowSettings(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (request) => {
    const cfg = getLLMConfig();
    if (cfg.provider !== 'mock' && !cfg.apiKey) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setCurrentStep('');
    setError('');
    setResult(null);

    try {
      const tripResult = await runTrip(request, (step) => setCurrentStep(step));
      setResult(tripResult);
      refreshMemories();
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
      setCurrentStep('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        memCount={memories.length}
        onSettings={() => setShowSettings(true)}
        configVersion={configVersion}
      />
      <HeroBanner />

      {/* Main content */}
      <main style={{ flex: 1, padding: '28px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div className="layout-grid">

          {/* ── LEFT COLUMN: Input + Memory + Lesson ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <InputPanel onSubmit={handleSubmit} isLoading={isLoading} />
            {result?.newLesson && <LessonView lesson={result.newLesson} />}
            <MemoryView memories={memories} onMemoriesChange={refreshMemories} />
          </div>

          {/* ── RIGHT COLUMN: Itinerary ── */}
          <div>
            <ItineraryView
              result={result}
              isLoading={isLoading}
              currentStep={currentStep}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 10,
        fontSize: 12, color: 'var(--text-muted)',
      }}>
        <span>
          🏦 ReasoningBank · A{' '}
          <a href="https://arxiv.org/abs/2406.14228" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
            Google Research
          </a>{' '}
          concept · Browser-only, no backend
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="tag tag-green">✓ GitHub Pages Ready</span>
          <span className="tag tag-blue">✓ Zero Backend</span>
          <span className="tag tag-purple">✓ NVIDIA NIM</span>
          <span className="tag tag-gold">✓ Proxy Routing</span>
        </div>
      </footer>

      {/* Modals & toasts */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={() => {
            refreshMemories();
            setConfigVersion(v => v + 1);
          }}
        />
      )}
      <ErrorToast message={error} onClose={() => setError('')} />
    </div>
  );
}
