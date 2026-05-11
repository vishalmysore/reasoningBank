/**
 * memoryStore.js — LocalStorage wrapper for ReasoningBank memories
 */

const MEMORIES_KEY    = 'reasoningbank_memories';
const TRAJECTORIES_KEY = 'reasoningbank_trajectories';

/**
 * safeSetItem — wrapped setItem with quota error handling
 */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn('[Storage] Quota exceeded. Attempting to prune trajectories...');
      // If we hit quota, the best thing to do is purge old trajectories
      // as they are the largest items and less critical than memories.
      if (key === TRAJECTORIES_KEY) {
        let items = JSON.parse(value);
        if (items.length > 5) {
          // Keep only the most recent 5 and try again
          const pruned = items.slice(0, 5);
          localStorage.setItem(TRAJECTORIES_KEY, JSON.stringify(pruned));
          return true;
        }
      } else {
        // If memories hit quota, we clear trajectories entirely to make room
        localStorage.removeItem(TRAJECTORIES_KEY);
        try {
          localStorage.setItem(key, value);
          return true;
        } catch {
          console.error('[Storage] Hard quota limit reached even after pruning.');
          return false;
        }
      }
    }
    return false;
  }
}

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
  safeSetItem(MEMORIES_KEY, JSON.stringify(memories));
}

export function updateMemoryUsage(id) {
  const memories = getAllMemories();
  const idx = memories.findIndex(m => m.id === id);
  if (idx !== -1) {
    memories[idx].usageCount = (memories[idx].usageCount || 0) + 1;
    safeSetItem(MEMORIES_KEY, JSON.stringify(memories));
  }
}

export function clearMemories() {
  localStorage.removeItem(MEMORIES_KEY);
}

export function deleteMemory(id) {
  const memories = getAllMemories().filter(m => m.id !== id);
  safeSetItem(MEMORIES_KEY, JSON.stringify(memories));
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
  // Keep last 20 only to prevent quota issues
  if (trajectories.length > 20) trajectories.length = 20;
  safeSetItem(TRAJECTORIES_KEY, JSON.stringify(trajectories));
}

export function clearTrajectories() {
  localStorage.removeItem(TRAJECTORIES_KEY);
}
