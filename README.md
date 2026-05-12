# 🏦 ReasoningBank Demo — AI Travel Agent

> **This is an unofficial demo implementation** of the ReasoningBank concept described in [Google Research (arXiv:2406.14228)](https://arxiv.org/abs/2406.14228). It is not affiliated with or endorsed by Google. The goal is to illustrate the core idea — structured memory + reflection + retrieval around an LLM — in a minimal, runnable browser app.

---

## What is ReasoningBank?

ReasoningBank is a [Google Research concept](https://arxiv.org/abs/2406.14228) where an AI agent improves over time by storing and reusing **structured experiences** from past tasks — not raw chat logs.

Instead of:
```
Prompt → Answer  (stateless)
```

ReasoningBank does:
```
Prompt → Retrieve past memories → Reason → Store new lesson → Improve next time
```

---

## Features

- ✈️ **AI Travel Planning** — generates detailed day-by-day itineraries via LLM
- 🧠 **ReasoningBank Memory** — stores structured lessons in browser-local IndexedDB
- 🔍 **Memory Retrieval** — keyword-scored search injects past lessons into every new plan
- ✨ **Reflection Engine** — every trip auto-generates a reusable lesson via LLM
- 📊 **Memory Browser** — search, inspect, and manage all stored memories
- ⚙️ **Multi-provider LLM** — supports OpenAI, Google Gemini, Anthropic, and **NVIDIA NIM**
- 🌐 **Proxy Support** — routes all API calls through a CORS proxy
- 🚀 **Zero Backend** — pure browser app, deployable to GitHub Pages

---

## The ReasoningBank Loop

```
User Request
   ↓
Retrieve past memories (IndexedDB)
   ↓
LLM generates travel plan
   ↓
Store reasoning trajectory
   ↓
LLM extracts new lesson (reflection)
   ↓
Save lesson to memory bank
   ↓
Future requests use accumulated memory ← improves over time
```

---

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/reasoningBankDemo.git
cd reasoningBankDemo
npm install
```

### 2. Run locally
```bash
npm run dev
```
Open `http://localhost:5173`

### 3. Configure your LLM
Click **⚙️ Settings** and enter your API key:
- **OpenAI**: Get a key at [platform.openai.com](https://platform.openai.com/api-keys)
- **Google Gemini**: Get a key at [aistudio.google.com](https://aistudio.google.com/app/apikey)

> Your API key is stored **in memory only** — never written to disk or any server.

---

## Storage: IndexedDB (Browser-Native)

All memories and trajectories are stored in **IndexedDB**, the browser's built-in structured storage engine.

### Why IndexedDB instead of localStorage?

| Feature | localStorage | IndexedDB |
|---|---|---|
| Quota | ~5 MB (shared per origin) | Hundreds of MB (per origin) |
| GitHub Pages | Shared across **all** your repos on `github.io` | Isolated per app |
| Data structure | Strings only | Structured objects |
| Async API | No | Yes (non-blocking) |

This matters in practice: GitHub Pages hosts all your repos under the same origin (`username.github.io`), which means every GitHub Pages app you have **shares the same 5 MB localStorage quota**. One full app breaks all the others. IndexedDB has no such limitation.

### Advantages for browser-based apps

- **No backend required** — persistent structured data without a server or database
- **No quota anxiety** — the browser allocates storage proportional to available disk space
- **Survives page reloads and browser restarts** — memories persist across sessions just like a real database
- **Automatic migration** — on first load the app silently moves any existing localStorage data into IndexedDB and clears the old keys

### What is stored

- `memories` object store — structured lessons learned from past trips (title, description, insights, tags, confidence score, usage count)
- `trajectories` object store — full reasoning trace for each trip (input, plan, agent steps)

Both stores are keyed by UUID and sorted newest-first on read. No data ever leaves your browser.

---

## Project Structure

```
src/
├── agent/
│   ├── travelAgent.js     # Orchestrator — runs the full ReasoningBank loop
│   ├── planner.js         # Generates itinerary via LLM + memory context
│   ├── reflector.js       # Extracts reusable lessons from completed trips
│   └── retriever.js       # Keyword-scored memory search (top-5 retrieval)
├── memory/
│   ├── memoryStore.js     # IndexedDB wrapper (memories + trajectories)
│   └── schema.js          # Memory & trajectory data models
├── utils/
│   └── llm.js             # OpenAI / Gemini / Anthropic / NVIDIA API wrapper
└── ui/
    ├── App.jsx             # Main shell
    └── components/
        ├── InputPanel.jsx      # Travel request form
        ├── ItineraryView.jsx   # Plan + reasoning + agent log tabs
        ├── MemoryView.jsx      # Memory browser with search & delete
        ├── LessonView.jsx      # Newly learned lesson display
        └── SettingsModal.jsx   # API key & provider configuration
```

---

## Data Models

### Memory (ReasoningBank Entry)
```json
{
  "id": "uuid",
  "title": "Avoid 1-night stays in Tokyo",
  "description": "Frequent hotel switching reduces travel quality",
  "content": [
    "Prefer minimum 2 nights per city",
    "Reduce packing overhead",
    "Improve itinerary stability"
  ],
  "tags": ["japan", "tokyo", "itinerary"],
  "confidence": 0.92,
  "timestamp": 1710000000000,
  "usageCount": 3
}
```

### Travel Trajectory
```json
{
  "id": "uuid",
  "input": "{ destination: 'Tokyo', days: 7, ... }",
  "plan": "Day 1: Arrive at Narita...",
  "reasoningSteps": ["🔍 Searching memories...", "✈️ Generating plan..."],
  "timestamp": 1710000000000
}
```

---

## Deploy to GitHub Pages

### Automatic (GitHub Actions)
Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and deploys automatically.

**Setup once:**
1. Go to repo **Settings → Pages**
2. Set source to **GitHub Actions**
3. Push to `main`

### Manual
```bash
npm run build
# Then push /dist to gh-pages branch
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Vanilla CSS (dark glassmorphism) |
| Storage | IndexedDB (browser-native) |
| LLM Providers | OpenAI, Gemini, Anthropic, **NVIDIA NIM** |
| Proxy | CORS Proxy (x-target-url header) |
| Deployment | GitHub Pages + GitHub Actions |
| Backend | **None** |

---

## Proxy & NVIDIA Support

All API calls go through a configurable proxy URL (default: `https://rough-tree-aee4.vishalmysore.workers.dev`). It uses the `x-target-url` header to route requests. NVIDIA NIM is fully supported via the `https://integrate.api.nvidia.com/v1` endpoint. Both can be configured in the **Settings** modal.

---

## Key Behaviors

| Behavior | Description |
|----------|-------------|
| **Memory Influence** | Output changes when relevant memories exist |
| **Learning Effect** | Second trip improves based on first trip's lesson |
| **Reflection Loop** | Every trip generates exactly one new reusable lesson |
| **Confidence Scoring** | Each memory has a 0–100% confidence rating |
| **Usage Tracking** | Tracks how many times each memory was retrieved |

---

## License

MIT
