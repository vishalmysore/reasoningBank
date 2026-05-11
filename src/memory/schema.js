/**
 * schema.js — Memory object structure for ReasoningBank
 */

/**
 * @typedef {Object} Memory
 * @property {string} id          - Unique identifier
 * @property {string} title       - Short lesson title
 * @property {string} description - One-sentence description
 * @property {string[]} content   - Array of reusable insight strings
 * @property {string[]} tags      - Destination/topic tags
 * @property {number} confidence  - 0.0–1.0
 * @property {number} timestamp   - Unix timestamp (ms)
 * @property {number} usageCount  - Times this memory was retrieved & used
 */

/**
 * @typedef {Object} Trajectory
 * @property {string}   id             - Unique identifier
 * @property {string}   input          - Original user request
 * @property {string}   plan           - Generated itinerary text
 * @property {string[]} reasoningSteps - Agent reasoning steps recorded
 * @property {number}   timestamp      - Unix timestamp (ms)
 */

export function createMemory({ title, description, content, tags, confidence }) {
  return {
    id: crypto.randomUUID(),
    title,
    description,
    content: Array.isArray(content) ? content : [content],
    tags: Array.isArray(tags) ? tags.map(t => t.toLowerCase().trim()) : [],
    confidence: Math.min(1, Math.max(0, confidence ?? 0.75)),
    timestamp: Date.now(),
    usageCount: 0,
  };
}

export function createTrajectory({ input, plan, reasoningSteps }) {
  return {
    id: crypto.randomUUID(),
    input,
    plan,
    reasoningSteps: Array.isArray(reasoningSteps) ? reasoningSteps : [],
    timestamp: Date.now(),
  };
}
