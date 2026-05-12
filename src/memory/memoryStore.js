/**
 * memoryStore.js — IndexedDB storage for ReasoningBank memories & trajectories.
 * Replaces the localStorage version which hit the shared github.io 5MB origin quota.
 * IndexedDB has a per-origin quota of hundreds of MB with no cross-repo sharing.
 */

const DB_NAME    = 'reasoningbank_db';
const DB_VERSION = 1;
const MEMORIES   = 'memories';
const TRAJECTORIES = 'trajectories';

// Lazy singleton — one open connection reused for all calls
let _dbPromise = null;

function getDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(MEMORIES)) {
        db.createObjectStore(MEMORIES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(TRAJECTORIES)) {
        db.createObjectStore(TRAJECTORIES, { keyPath: 'id' });
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror  = ()  => reject(req.error);
  }).then(async (db) => {
    await _migrateFromLocalStorage(db);
    return db;
  });
  return _dbPromise;
}

// ── IndexedDB helpers ─────────────────────────────────────────

function _getAll(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror  = () => reject(req.error);
  });
}

function _get(store, id) {
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror  = () => reject(req.error);
  });
}

function _put(store, item) {
  return new Promise((resolve, reject) => {
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror  = () => reject(req.error);
  });
}

function _delete(store, id) {
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror  = () => reject(req.error);
  });
}

function _clear(store) {
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror  = () => reject(req.error);
  });
}

// ── One-time migration from localStorage ──────────────────────

async function _migrateFromLocalStorage(db) {
  try {
    if (localStorage.getItem('reasoningbank_idb_migrated')) return;

    const rawMemories     = localStorage.getItem('reasoningbank_memories');
    const rawTrajectories = localStorage.getItem('reasoningbank_trajectories');

    if (rawMemories) {
      const items = JSON.parse(rawMemories);
      if (items.length > 0) {
        const tx    = db.transaction(MEMORIES, 'readwrite');
        const store = tx.objectStore(MEMORIES);
        // Submit all puts synchronously before any await so the transaction stays open
        await Promise.all(items.map(m => _put(store, m)));
      }
      localStorage.removeItem('reasoningbank_memories');
    }

    if (rawTrajectories) {
      const items = JSON.parse(rawTrajectories);
      if (items.length > 0) {
        const tx    = db.transaction(TRAJECTORIES, 'readwrite');
        const store = tx.objectStore(TRAJECTORIES);
        await Promise.all(items.map(t => _put(store, t)));
      }
      localStorage.removeItem('reasoningbank_trajectories');
    }

    localStorage.setItem('reasoningbank_idb_migrated', '1');
    console.log('[Storage] Migrated from localStorage to IndexedDB.');
  } catch (e) {
    console.warn('[Storage] Migration skipped:', e.message);
  }
}

// ── Memories ──────────────────────────────────────────────────

export async function getAllMemories() {
  const db    = await getDB();
  const tx    = db.transaction(MEMORIES, 'readonly');
  const items = await _getAll(tx.objectStore(MEMORIES));
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

export async function saveMemory(memory) {
  const db = await getDB();
  const tx = db.transaction(MEMORIES, 'readwrite');
  await _put(tx.objectStore(MEMORIES), memory);
}

export async function updateMemoryUsage(id) {
  const db = await getDB();

  // Read in one transaction, write in another (await between is fine here)
  const readTx = db.transaction(MEMORIES, 'readonly');
  const memory = await _get(readTx.objectStore(MEMORIES), id);
  if (!memory) return;

  memory.usageCount = (memory.usageCount || 0) + 1;
  const writeTx = db.transaction(MEMORIES, 'readwrite');
  await _put(writeTx.objectStore(MEMORIES), memory);
}

export async function clearMemories() {
  const db = await getDB();
  const tx = db.transaction(MEMORIES, 'readwrite');
  await _clear(tx.objectStore(MEMORIES));
}

export async function deleteMemory(id) {
  const db = await getDB();
  const tx = db.transaction(MEMORIES, 'readwrite');
  await _delete(tx.objectStore(MEMORIES), id);
}

// ── Trajectories ──────────────────────────────────────────────

export async function getAllTrajectories() {
  const db    = await getDB();
  const tx    = db.transaction(TRAJECTORIES, 'readonly');
  const items = await _getAll(tx.objectStore(TRAJECTORIES));
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

export async function saveTrajectory(trajectory) {
  const db = await getDB();
  const tx = db.transaction(TRAJECTORIES, 'readwrite');
  await _put(tx.objectStore(TRAJECTORIES), trajectory);
}

export async function clearTrajectories() {
  const db = await getDB();
  const tx = db.transaction(TRAJECTORIES, 'readwrite');
  await _clear(tx.objectStore(TRAJECTORIES));
}
