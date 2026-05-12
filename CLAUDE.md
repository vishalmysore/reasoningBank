# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build (outputs to /dist)
npm run preview   # Preview the production build locally
npm run deploy    # Build + push to gh-pages branch
```

There is no test suite. The app uses a `mock` provider (selectable in Settings) for testing without a real API key.

## Architecture

**ReasoningBank Demo** is a browser-only React + Vite SPA. There is no backend — all state lives in `localStorage`. It deploys to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

### The Agent Loop

`src/agent/travelAgent.js` orchestrates the full cycle:
1. **Retrieve** — `retriever.js` keyword-scores all memories in localStorage and returns top-5
2. **Plan** — `planner.js` builds a prompt injecting those memories and calls the LLM
3. **Save trajectory** — raw execution steps are persisted to `reasoningbank_trajectories`
4. **Reflect** — `reflector.js` asks the LLM to extract a single reusable lesson from the completed trip
5. **Save memory** — the lesson is stored to `reasoningbank_memories`; future trips use it

### LLM Layer (`src/utils/llm.js`)

All API calls are routed through a configurable CORS proxy using the `x-target-url` header (default proxy: `https://rough-tree-aee4.vishalmysore.workers.dev`). Supported providers: OpenAI, Google Gemini, Anthropic, NVIDIA NIM, and a built-in Mock provider. Config (provider, apiKey, model, proxyUrl) is held in module-level state; `proxyUrl` is also persisted to localStorage.

### Storage (`src/memory/memoryStore.js`)

Two localStorage keys: `reasoningbank_memories` and `reasoningbank_trajectories`. `safeSetItem` handles `QuotaExceededError` by purging trajectories first, then pruning memories to the last 10 as a last resort. Trajectories are capped at 20 entries. The Settings modal has a "Clear All Data" button for manual recovery.

### Data Models (`src/memory/schema.js`)

- **Memory**: `{ id, title, description, content[], tags[], confidence (0–1), timestamp, usageCount }`
- **Trajectory**: `{ id, input, plan, reasoningSteps[], timestamp }`

### UI Structure (`src/ui/`)

`App.jsx` is the single stateful root — it calls `runTrip()` and distributes results. Layout is a two-column grid: left column has `InputPanel` → `LessonView` → `MemoryView`; right column has `ItineraryView` (tabbed: Plan / Reasoning / Agent Log). `SettingsModal` is a modal overlay.

### Vite Config

`vite.config.js` sets `base: '/reasoningBankDemo/'` for production builds (GitHub Pages sub-path) and `base: '/'` for dev.
