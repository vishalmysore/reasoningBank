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
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22) {
      console.warn(`[Storage] Quota exceeded for ${key}. Hard-purging trajectories to recover space...`);
      
      // 1. Always purge trajectories first as they are secondary data
      localStorage.removeItem(TRAJECTORIES_KEY);
      
      try {
        // 2. Try setting the item again
        localStorage.setItem(key, value);
        return true;
      } catch (e2) {
        // 3. If it still fails, it means even with trajectories gone, the data is too large 
        // or the origin quota is full of other apps' data.
        if (key === MEMORIES_KEY) {
          console.warn('[Storage] Memory quota exceeded. Pruning memories to last 10...');
          const items = JSON.parse(value);
          const pruned = items.slice(0, 10);
          try {
            localStorage.setItem(MEMORIES_KEY, JSON.stringify(pruned));
            return true;
          } catch {
            console.error('[Storage] CRITICAL: Origin quota is completely full (likely by other apps on this domain).');
            return false;
          }
        }
        return false;
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
