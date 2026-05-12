/**
 * SettingsModal.jsx — Configure LLM provider, model, API key, and proxy URL
 * Mirrors the llmwikizz pattern with full proxy support + NVIDIA NIM.
 */
import React, { useState, useEffect } from 'react';
import { setLLMConfig, getLLMConfig, PROVIDERS, getDefaultProxy, testConnection } from '../../utils/llm.js';
import { clearMemories, clearTrajectories } from '../../memory/memoryStore.js';

export default function SettingsModal({ onClose, onSave }) {
  const cfg = getLLMConfig();
  const [provider, setProvider] = useState(cfg.provider || 'openai');
  const [apiKey,   setApiKey]   = useState(cfg.apiKey   || '');
  const [model,    setModel]    = useState(cfg.model    || '');
  const [proxyUrl, setProxyUrl] = useState(cfg.proxyUrl || getDefaultProxy());
  const [showKey,  setShowKey]  = useState(false);
  const [testing,  setTesting]  = useState(false);
  const [testResult, setTestResult] = useState(null); // null | 'ok' | 'fail'
  const [testMsg,  setTestMsg]  = useState('');
  const [saved,    setSaved]    = useState(false);

  const providerInfo = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  // When provider changes, reset model to first available
  useEffect(() => {
    const info = PROVIDERS.find(p => p.id === provider);
    if (info) setModel(info.models[0].id);
  }, [provider]);

  const handleSave = () => {
    const finalProxy = proxyUrl.trim() || getDefaultProxy();
    const finalKey = provider === 'mock' ? 'MOCK_KEY' : apiKey;
    setLLMConfig({ provider, apiKey: finalKey, model, proxyUrl: finalProxy });
    setSaved(true);
    setTimeout(() => { setSaved(false); onSave?.(); onClose(); }, 700);
  };

  const handleTest = async () => {
    if (provider !== 'mock' && !apiKey.trim()) { setTestResult('fail'); setTestMsg('Enter an API key first.'); return; }
    // Temporarily apply config for test
    const finalKey = provider === 'mock' ? 'MOCK_KEY' : apiKey;
    setLLMConfig({ provider, apiKey: finalKey, model, proxyUrl: proxyUrl.trim() || getDefaultProxy() });
    setTesting(true);
    setTestResult(null);
    setTestMsg('');
    try {
      const res = await testConnection();
      setTestResult('ok');
      setTestMsg(`✅ Connected! Response: "${res.text.slice(0, 40)}…" (${res.latencyMs}ms)`);
    } catch (err) {
      setTestResult('fail');
      setTestMsg(`❌ ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleProxyReset = () => setProxyUrl(getDefaultProxy());

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div className="glass fade-in" style={{
        width: '100%', maxWidth: 500, padding: '28px 28px 24px',
        borderRadius: 'var(--radius-lg)', maxHeight: '92vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>⚙️ Settings</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              LLM provider, model, API key &amp; proxy
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 22, lineHeight: 1,
          }}>✕</button>
        </div>

        {/* ── Provider pills ── */}
        <div style={{ marginBottom: 18 }}>
          <label>LLM Provider</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            {PROVIDERS.map(p => (
              <button key={p.id} type="button" onClick={() => setProvider(p.id)} style={{
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                transition: 'var(--transition)', textAlign: 'left',
                border: provider === p.id ? '2px solid var(--accent-primary)' : '2px solid var(--border)',
                background: provider === p.id ? 'rgba(96,165,250,0.08)' : 'rgba(255,255,255,0.03)',
                color: provider === p.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Model ── */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="rb-model-select">Model</label>
          <select id="rb-model-select" value={model} onChange={e => setModel(e.target.value)} style={{ marginTop: 6 }}>
            {providerInfo.models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* ── API Key ── */}
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="rb-api-key">
            API Key&nbsp;
            <a href={
              provider === 'openai'    ? 'https://platform.openai.com/api-keys' :
              provider === 'gemini'    ? 'https://aistudio.google.com/app/apikey' :
              provider === 'anthropic' ? 'https://console.anthropic.com/keys' :
              'https://build.nvidia.com'
            } target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--accent-primary)', fontSize: 10, fontWeight: 400, textDecoration: 'none' }}>
              Get key ↗
            </a>
          </label>
          <div style={{ position: 'relative', marginTop: 6 }}>
            <input
              id="rb-api-key"
              type={showKey ? 'text' : 'password'}
              placeholder={providerInfo.keyPlaceholder}
              value={provider === 'mock' ? '' : apiKey}
              onChange={e => setApiKey(e.target.value)}
              disabled={provider === 'mock'}
              style={{ paddingRight: 44, opacity: provider === 'mock' ? 0.6 : 1 }}
            />
            {provider !== 'mock' && (
              <button type="button" onClick={() => setShowKey(s => !s)} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 16,
              }}>{showKey ? '🙈' : '👁️'}</button>
            )}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.5 }}>
            {provider === 'mock' 
              ? '🧪 Mock mode: No API key or proxy needed. Responses are simulated.'
              : '🔒 Stored in memory only — never saved to disk or sent anywhere except the LLM provider.'
            }
          </p>
        </div>

        {/* ── Test Connection ── */}
        <div style={{ marginBottom: 20 }}>
          <button id="rb-test-btn" type="button" className="btn btn-ghost"
            style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={handleTest} disabled={testing || (provider !== 'mock' && !apiKey.trim())}>
            {testing ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Testing…</> : '🧪 Test Connection'}
          </button>
          {testMsg && (
            <div style={{
              marginTop: 8, padding: '8px 12px', borderRadius: 6, fontSize: 12,
              background: testResult === 'ok' ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
              border: `1px solid ${testResult === 'ok' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
              color: testResult === 'ok' ? 'var(--accent-green)' : 'var(--accent-red)',
            }}>{testMsg}</div>
          )}
        </div>

        <div className="divider" />

        {/* ── Proxy URL ── */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="rb-proxy-url">
            Proxy URL
            <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 6, color: 'var(--text-muted)' }}>
              (routes API calls to bypass CORS)
            </span>
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input
              id="rb-proxy-url"
              type="text"
              placeholder={getDefaultProxy()}
              value={proxyUrl}
              onChange={e => setProxyUrl(e.target.value)}
            />
            <button id="rb-reset-proxy-btn" type="button" className="btn btn-ghost"
              style={{ padding: '8px 12px', fontSize: 12, flexShrink: 0, whiteSpace: 'nowrap' }}
              onClick={handleProxyReset} title="Reset to default proxy">
              ↺ Reset
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.5 }}>
            All API calls are routed via this proxy using the <code style={{ fontSize: 10, color: 'var(--accent-primary)' }}>x-target-url</code> header.
            Leave as default or point to your own Cloudflare Worker.
          </p>
        </div>

        <div className="divider" />

        {/* ── Danger Zone ── */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: 'var(--accent-red)' }}>⚠️ Danger Zone</label>
          <div style={{ marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" style={{
              width: '100%', color: 'var(--accent-red)', borderColor: 'rgba(248,113,113,0.2)',
              fontSize: 12, padding: '10px'
            }} onClick={async () => {
              if (window.confirm('Delete all stored memories and trajectories? This cannot be undone.')) {
                await clearMemories();
                await clearTrajectories();
                onSave?.();
                onClose();
              }
            }}>
              🗑️ Clear All Local Data
            </button>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
              Useful if you encounter "Storage Quota Exceeded" errors on this domain.
            </p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button id="rb-save-settings-btn" className="btn btn-primary" style={{ flex: 1 }}
            onClick={handleSave} disabled={provider !== 'mock' && !apiKey.trim()}>
            {saved ? '✅ Saved!' : '💾 Save Settings'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
