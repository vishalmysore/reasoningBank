# ReasoningBank: Building AI Agents that Actually Learn from Experience

In the world of Large Language Models (LLMs), we often face a frustrating paradox: LLMs are incredibly capable at "reasoning" in the moment, but they are fundamentally **stateless**. Every time you start a new session, the agent has total amnesia. It doesn't remember the brilliant travel itinerary it planned yesterday, nor does it remember the mistake it made when it suggested a hotel that was too far from the airport.

**ReasoningBank** is a research concept (pioneered by Google Research) that aims to solve this "amnesia problem" not through model retraining or fine-tuning, but through a structured, persistent memory system.

> [!NOTE]
> This project, the **ReasoningBank AI Travel Agent**, is an **independent demonstration** and educational tool inspired by the ReasoningBank philosophy. While it implements the core loop of structured experience storage, it is not an official Google Research product.

---

## What is a ReasoningBank?

Most AI memory systems (like RAG) focus on storing **data**—documents, PDFs, or raw chat transcripts. ReasoningBank focuses on storing **experience**.

Instead of saving a 10,000-word chat log, a ReasoningBank agent performs a "Reflection" step at the end of a task. It asks itself: *"What did I learn from this? What general rule should I follow next time?"*

It then stores this as a structured **Lesson**:
- **Title**: *Avoid 1-night stays in Tokyo.*
- **Insight**: *Hotel switching overhead in Japan consumes too much travel time; prefer 2+ nights.*
- **Tags**: `#japan`, `#logistics`

The next time you ask for a trip to Tokyo, the agent "remembers" this specific lesson and applies it before you even have to ask.

---

## The Three Pillars of the Implementation

Our Travel Agent demonstrates the ReasoningBank loop through three core modules:

### 1. The Retriever (The Search for Experience)
Before the agent calls the LLM, it scans the user's local memory for relevant lessons. The retrieval uses a **weighted keyword-scoring algorithm**:
- **Tokenization**: It strips stop-words and tokenizes the user's destination and preferences.
- **Scoring**: It calculates a score based on matches in the `tags` (3x weight) and the `content/description` (1x weight) of stored memories.
- **Ranking**: Results are further adjusted by the lesson's **Confidence Score** (assigned by the LLM during reflection) and **Usage Count** (how often it's been useful before).

### 2. The Planner (Reasoning with Context)
The Planner isn't just a generic travel bot. It is specifically instructed to *prioritize* the top-5 retrieved lessons. If a past lesson says "Avoid late-night arrivals in London," the planner will proactively suggest morning flights. This creates a "Memory Influence" effect where the AI's behavior changes based on what it "learned" in previous sessions.

### 3. The Reflector (The Learning Engine)
This is the most critical step. Once an itinerary is generated, the system initiates a **Reflection Phase**. A second LLM call (the Reflector) analyzes the generated plan and the agent's internal logs.

**How it distills knowledge:**
- **Generalization**: The reflector is prompted to strip away user-specific details (like dates or specific budgets) and extract "evergreen" strategies.
- **The Lesson Schema**: Every lesson is stored as a structured JSON object:
  ```json
  {
    "title": "MEMORABLE_TITLE",
    "description": "ONE_SENTENCE_CORE_LESSON",
    "content": ["insight_1", "insight_2"],
    "tags": ["topic", "destination"],
    "confidence": 0.0-1.0,
    "usageCount": 0
  }
  ```
- **Metadata**: We track `usageCount` and `timestamp` to ensure the Retriever can prioritize fresh and proven lessons in the next cycle.

### 4. Capturing Reasoning Trajectories
Unlike simple chat bots, this agent explicitly captures its "chain of thought."
- **Internal Logs**: The `travelAgent.js` orchestrator maintains a `steps` array, logging every action from keyword extraction to reflection.
- **Explicit Reasoning**: The LLM is prompted to return a JSON object that separates the `itinerary` (the "what") from the `reasoning` (the "why"). This reasoning field is where the agent explains how it applied retrieved memories to the current task.
- **Persistence**: Both the logs and the reasoning are saved in a `Trajectory` object in `localStorage`, allowing for a full audit of the agent's decision-making history.

---

## Architecture: Zero-Server, Multi-Provider

One of the most distinctive and interesting aspects of this demonstration is that it runs **entirely in the browser**. 

### Multi-Provider Integration
The project uses a unified LLM client that normalizes requests across four major providers: **OpenAI, Anthropic, Google Gemini, and NVIDIA NIM**. Each provider has its own header and body requirements (e.g., Anthropic's `x-api-key` vs. OpenAI's `Authorization`), which are handled by a standard mapping layer in the application's utility code.



### Local Storage
Data is stored locally in the browser's `localStorage`. While this ensures the data never leaves the user's machine (eliminating the need for a backend database), it is important to note that `localStorage` is **persistent but unencrypted**. It is a tool for convenience and privacy from third-party servers, not a solution for highly sensitive data.

---

## Conclusion

ReasoningBank represents a shift from "Chatbots" to "Agents." A chatbot answers questions; an agent **accumulates expertise**. 

By separating the **Reasoning** (the LLM) from the **Experience** (the ReasoningBank), we can build AI systems that feel like they have a persistent identity and a growing skill set. Whether you are using a top-tier NVIDIA NIM model or the built-in **Mock AI mode** for testing, the loop remains the same: 

**Act → Reflect → Learn → Improve.**
