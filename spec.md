0. What is ReasoningBank?

ReasoningBank is a research concept from Google that describes:

A system where AI agents improve over time by storing and reusing structured experiences from past tasks.

Instead of saving raw conversations, the system stores:

reasoning patterns
decisions made
mistakes and failures
reusable strategies (“lessons”)

Then, before solving a new task, the agent:

retrieves relevant past experiences
injects them into its reasoning context
performs better because it “remembers how it previously solved similar problems”
Key Idea

Traditional LLM agent:

Prompt → Answer (stateless)

ReasoningBank agent:

Prompt → Retrieve past experiences → Reason → Store new lesson → Improve next time
What makes it different
NOT model training
NOT fine-tuning
NOT RL

It is:

A structured memory + reflection + retrieval system around an LLM

📦 SPEC: ReasoningBank Travel Agent (GitHub Pages Only)
1. Project Goal

Build a browser-only AI Travel Agent that:

runs entirely on GitHub Pages (no backend)
uses an LLM API from the browser
stores “experiences” locally in the browser
improves travel plans over time using a ReasoningBank-style memory system

The system simulates learning from experience by:

saving structured travel lessons
retrieving relevant past experiences
injecting them into new planning prompts
reflecting on outcomes after every trip
2. What is ReasoningBank (in this project)

ReasoningBank is a pattern where an AI agent:

learns from past reasoning episodes by storing structured “experiences” and reusing them in future decisions.

Instead of storing chat logs, it stores:

decisions
failures
strategies
reusable insights
Key Loop
User Request
   ↓
Retrieve past memories (LocalStorage)
   ↓
LLM generates travel plan
   ↓
Store reasoning trajectory
   ↓
LLM extracts new lesson (reflection)
   ↓
Save lesson to memory bank
   ↓
Future requests use accumulated memory

This creates a self-improving agent without training or backend systems.

3. Constraints (VERY IMPORTANT)

This project MUST run on:

GitHub Pages only
Pure frontend (React or Vanilla JS)
No server
No database
No authentication backend

Allowed:

LocalStorage / IndexedDB
Direct LLM API calls
Static assets

Not allowed:

Express / Node backend
SQLite server
cloud database
server-side logic
4. Tech Stack
Frontend
React (Vite) OR Vanilla JS (preferred minimal version)
TailwindCSS (optional)
Fetch API
Storage
LocalStorage (primary memory store)
LLM
OpenAI API OR Gemini API (client-side calls)
5. System Architecture
┌──────────────────────┐
│   User Input (UI)     │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ Travel Agent (JS)     │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ Memory Retriever      │ ← LocalStorage
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ LLM Planner Call      │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ Trajectory Recorder    │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ LLM Reflection Engine │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ Memory Store          │ ← LocalStorage
└──────────────────────┘
6. Project Structure
/src
  /agent
    travelAgent.js        # orchestrator
    planner.js            # itinerary generation
    reflector.js          # lesson extraction
    retriever.js          # memory search

  /memory
    memoryStore.js        # LocalStorage wrapper
    schema.js             # memory structure

  /utils
    llm.js                # API wrapper
    storage.js            # helper functions

  /ui
    App.jsx               # main UI
    components/
      InputPanel.jsx
      ItineraryView.jsx
      MemoryView.jsx
      LessonView.jsx

index.html
7. Data Models
7.1 Memory Object (ReasoningBank Entry)
{
  title: string,
  description: string,
  content: string[],
  tags: string[],
  confidence: number,
  timestamp: number
}
Example
{
  "title": "Avoid 1-night stays in Tokyo",
  "description": "Frequent hotel switching reduces travel quality",
  "content": [
    "Prefer minimum 2 nights per city",
    "Reduce packing overhead",
    "Improve itinerary stability"
  ],
  "tags": ["japan", "itinerary"],
  "confidence": 0.92,
  "timestamp": 1710000000
}
7.2 Travel Trajectory
{
  input: string,
  plan: string,
  reasoningSteps: string[],
  timestamp: number
}
8. Core Modules
8.1 travelAgent.js (ORCHESTRATOR)
Responsibilities
Accept user input
Retrieve relevant memories
Call planner
Store trajectory
Call reflector
Save new memory
Return final output
Flow
runTrip(input)

Steps:

memories = retriever.get(input)
plan = planner.generate(input, memories)
save trajectory
lesson = reflector.analyze(plan)
memoryStore.save(lesson)
return result
8.2 planner.js
Purpose

Generate travel itinerary using LLM + memory context

Input
user request
retrieved memories
Output
{
  "itinerary": "...",
  "reasoning": "...",
  "assumptions": []
}
Prompt Rules

Must include:

budget constraints
duration constraints
past memories
preferences
8.3 reflector.js (MOST IMPORTANT)
Purpose

Convert experience into reusable knowledge.

Input
input
plan
reasoning
Output

Structured memory:

{
  "title": "",
  "description": "",
  "content": [],
  "tags": [],
  "confidence": 0.0
}
Rules

Must:

generalize insights
avoid user-specific statements
focus on reusable travel strategies
8.4 retriever.js
Purpose

Fetch relevant memories from LocalStorage

Logic (MVP)
filter memories where:
- tags match input keywords OR
- content includes keyword matches

Return top 5 most relevant memories.

8.5 memoryStore.js
Storage Layer

Uses LocalStorage key:

"reasoningbank_memories"
Methods
save(memory)
getAll()
clear()
9. LLM Integration (client-side)
llm.js

Wrap OpenAI / Gemini API:

export async function callLLM(prompt) {
  return fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });
}
10. UI Requirements
Main Screen
Input Panel
destination
budget
days
preferences
Output Panel

Show:

Itinerary
Day 1: Tokyo
Day 2: Kyoto
Reasoning
We optimized train routes based on prior memory...
Memory Panel
🧠 ReasoningBank:
- Avoid hotel hopping in Japan
- Train travel preferred for short distances
New Lesson Panel
✨ New Insight Learned:
Avoid 1-night stays in Tokyo
11. Execution Flow
1. User submits request
2. Retrieve memories
3. Generate itinerary (LLM)
4. Store trajectory
5. Reflect on plan (LLM)
6. Save new memory
7. Render result
12. GitHub Pages Deployment
Steps
npm run build
npm run deploy

or GitHub Actions:

build Vite app
deploy /dist to gh-pages branch
13. Key Product Behavior

The system MUST demonstrate:

1. Memory Influence
output changes when memory exists
2. Learning Effect
second trip improves based on first
3. Reflection Loop
every trip generates a new lesson
14. MVP Constraints

Do NOT include:

backend servers
authentication
real booking APIs
payment systems
complex agent frameworks

Focus ONLY on:

reasoning
memory
improvement loop
15. “Wow Factor” Features (Optional but Recommended)
15.1 Before vs After

Show:

Without memory → generic itinerary
With memory → optimized itinerary
15.2 Learning Timeline
Trip 1 → learned X
Trip 2 → reused X
Trip 3 → improved X
15.3 Failure Memory Highlight
⚠️ Lesson:
Avoid short layovers in US airports (<90 min)
16. Final Vision

This app demonstrates:

A fully browser-based AI agent that accumulates structured experience over time, implementing a lightweight ReasoningBank system without any backend infrastructure.