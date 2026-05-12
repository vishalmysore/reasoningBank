/**
 * llm.js — LLM API wrapper with proxy support
 * Supports: OpenAI, Gemini, Anthropic, NVIDIA NIM
 * All calls routed through a configurable CORS proxy.
 */

const DEFAULT_PROXY = 'https://quantumstudio.visrow.workers.dev/';

export const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    keyPlaceholder: 'sk-…',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt-4o-mini',  name: 'GPT-4o Mini (fast, recommended)' },
      { id: 'gpt-4o',       name: 'GPT-4o' },
      { id: 'gpt-4-turbo',  name: 'GPT-4 Turbo' },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '✨',
    keyPlaceholder: 'AIza…',
    endpoint: 'https://generativelanguage.googleapis.com',
    models: [
      { id: 'gemini-2.0-flash',   name: 'Gemini 2.0 Flash (recommended)' },
      { id: 'gemini-1.5-flash',   name: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.5-pro',     name: 'Gemini 1.5 Pro' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🧬',
    keyPlaceholder: 'sk-ant-…',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (recommended)' },
      { id: 'claude-3-haiku-20240307',    name: 'Claude 3 Haiku (fast)' },
      { id: 'claude-3-opus-20240229',     name: 'Claude 3 Opus (powerful)' },
    ],
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    icon: '🟢',
    keyPlaceholder: 'nvapi-…',
    endpoint: 'https://integrate.api.nvidia.com/v1',
    models: [
      { id: 'nvidia/nemotron-nano-12b-v2-vl',         name: 'Nano 12B V2' },
      { id: 'meta/llama-3.1-70b-instruct',            name: 'Llama 3.1 70B Instruct' },
      { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Llama 3.1 Nemotron 70B' },
    ],
  },
  {
    id: 'mock',
    name: 'Mock AI',
    icon: '🧪',
    keyPlaceholder: 'No key needed',
    endpoint: 'mock',
    models: [
      { id: 'mock-agent', name: 'Mock Agent v1' },
    ],
  },
];

// ── Config state ───────────────────────────────────────────
let _config = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
  proxyUrl: loadProxyUrl(),
};

function loadProxyUrl() {
  try {
    return localStorage.getItem('reasoningbank_proxy_url') || DEFAULT_PROXY;
  } catch {
    return DEFAULT_PROXY;
  }
}

export function setLLMConfig(config) {
  _config = { ..._config, ...config };
  if (config.proxyUrl !== undefined) {
    try {
      localStorage.setItem('reasoningbank_proxy_url', config.proxyUrl || DEFAULT_PROXY);
    } catch { /* ignore */ }
  }
}

export function getLLMConfig() {
  return { ..._config, proxyUrl: _config.proxyUrl || DEFAULT_PROXY };
}

export function getDefaultProxy() {
  return DEFAULT_PROXY;
}

// ── Main caller ────────────────────────────────────────────

/**
 * callLLM — send a prompt through the proxy and return text
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function callLLM(prompt) {
  if (_config.provider !== 'mock' && !_config.apiKey) {
    throw new Error('API key not configured. Please open Settings and add your API key.');
  }
  const providerDef = PROVIDERS.find(p => p.id === _config.provider);
  if (!providerDef) throw new Error(`Unknown provider: ${_config.provider}`);

  const result = await _callProvider(providerDef, _config.apiKey, _config.model, prompt, _config.proxyUrl);
  return result.text;
}

/**
 * testConnection — send a minimal request to verify API key works
 */
export async function testConnection() {
  if (_config.provider !== 'mock' && !_config.apiKey) throw new Error('No API key configured.');
  const providerDef = PROVIDERS.find(p => p.id === _config.provider);
  const result = await _callProvider(providerDef, _config.apiKey, _config.model, 'Say OK', _config.proxyUrl, 10);
  return result;
}

// ── Internal provider routing ──────────────────────────────

async function _callProvider(providerDef, apiKey, model, prompt, proxyUrl, maxTokens = 2048) {
  const start = Date.now();

  // ── Mock Logic ───────────────────────────────────────────
  if (providerDef.id === 'mock') {
    await new Promise(r => setTimeout(r, 800)); // Simulate latency
    
    // Determine if this is a planner call, reflection call, or test call
    let responseText = '';
    if (prompt.includes('valid JSON') && prompt.includes('itinerary')) {
      responseText = JSON.stringify({
        itinerary: `[MOCK] Day 1: Explore local markets\n[MOCK] Day 2: Visit historical museum\n[MOCK] Day 3: Relax at city park\n\n(This is a simulated response for testing)`,
        reasoning: "I optimized the route to minimize walking as suggested by your preferences.",
        assumptions: ["Assume public transport is available", "Assume good weather"]
      });
    } else if (prompt.includes('reusable travel lesson')) {
      responseText = JSON.stringify({
        title: "Check Local Holiday Schedules",
        description: "Museums in many regions close on Mondays.",
        content: ["Always verify opening hours before planning a specific day", "Have a backup 'outdoor' activity ready"],
        tags: ["logistics", "tips"],
        confidence: 0.95
      });
    } else if (prompt.includes('Say OK')) {
      responseText = "OK";
    } else {
      responseText = "This is a mock AI response for testing purposes.";
    }

    return { text: responseText, tokensUsed: 150, latencyMs: Date.now() - start };
  }

  const proxy = proxyUrl || DEFAULT_PROXY;

  let apiEndpoint = providerDef.endpoint;
  // NVIDIA: ensure /chat/completions suffix
  if (providerDef.id === 'nvidia' && !apiEndpoint.endsWith('/chat/completions')) {
    apiEndpoint += '/chat/completions';
  }

  // Gemini: key goes in query string
  const targetUrl = providerDef.id === 'gemini'
    ? `${apiEndpoint}/v1beta/models/${model}:generateContent?key=${apiKey}`
    : apiEndpoint;

  // Build headers — proxy routing via x-target-url
  const headers = {
    'Content-Type': 'application/json',
    'x-target-url': targetUrl,
  };

  // Provider-specific auth headers
  if (providerDef.id === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else if (providerDef.id === 'openai' || providerDef.id === 'nvidia') {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  // Gemini: key in URL, no auth header

  // Build body
  let body;
  if (providerDef.id === 'anthropic') {
    body = {
      model,
      max_tokens: maxTokens,
      system: 'You are a helpful travel planning assistant with memory capabilities.',
      messages: [{ role: 'user', content: prompt }],
    };
  } else if (providerDef.id === 'gemini') {
    body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
    };
  } else {
    // OpenAI & NVIDIA NIM (OpenAI-compatible)
    body = {
      model,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    };
  }

  console.log(`[LLM] Provider: ${providerDef.id} | Model: ${model}`);
  console.log(`[Proxy] → ${proxy}`);
  console.log(`[Target URL] → ${targetUrl}`);
  console.log(`[Headers]`, JSON.stringify(headers, null, 2));

  const res = await fetch(proxy, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`${providerDef.name} API error (${res.status}): ${msg}`);
  }

  // Parse response
  let text = '';
  let tokensUsed = 0;

  if (providerDef.id === 'anthropic') {
    text = data.content?.[0]?.text || '';
    tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
  } else if (providerDef.id === 'gemini') {
    text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    tokensUsed = (data.usageMetadata?.promptTokenCount || 0) + (data.usageMetadata?.candidatesTokenCount || 0);
  } else {
    text = data.choices?.[0]?.message?.content || '';
    tokensUsed = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);
  }

  return { text: text.trim(), tokensUsed, latencyMs: Date.now() - start };
}
