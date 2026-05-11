/**
 * memoryStore.js — LocalStorage wrapper for ReasoningBank memories
 */

const MEMORIES_KEY    = 'reasoningbank_memories';
const TRAJECTORIES_KEY = 'reasoningbank_trajectories';

// ── Memories ──────────────────────────────────────────────

export function getAllMemories() {
  try {
    const raw = localStorage.getItem(MEMORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMemory(memory) {
  const memories = getAllMemories();
  memories.unshift(memory); // newest first
  localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
}

export function updateMemoryUsage(id) {
  const memories = getAllMemories();
  const idx = memories.findIndex(m => m.id === id);
  if (idx !== -1) {
    memories[idx].usageCount = (memories[idx].usageCount || 0) + 1;
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
  }
}

export function clearMemories() {
  localStorage.removeItem(MEMORIES_KEY);
}

export function deleteMemory(id) {
  const memories = getAllMemories().filter(m => m.id !== id);
  localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
}

// ── Trajectories ──────────────────────────────────────────

export function getAllTrajectories() {
  try {
    const raw = localStorage.getItem(TRAJECTORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTrajectory(trajectory) {
  const trajectories = getAllTrajectories();
  trajectories.unshift(trajectory);
  // Keep last 50 only
  if (trajectories.length > 50) trajectories.length = 50;
  localStorage.setItem(TRAJECTORIES_KEY, JSON.stringify(trajectories));
}

export function clearTrajectories() {
  localStorage.removeItem(TRAJECTORIES_KEY);
}
