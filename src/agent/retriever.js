/**
 * retriever.js — Retrieve relevant memories from LocalStorage
 * MVP: keyword match on tags + content. Returns top 5.
 */
import { getAllMemories, updateMemoryUsage } from '../memory/memoryStore.js';

/**
 * Extract keywords from a user query string.
 */
function extractKeywords(text) {
  const stopWords = new Set([
    'i','me','my','the','a','an','is','are','was','were','be','been','have',
    'has','had','do','does','did','will','would','could','should','may','might',
    'shall','can','to','of','in','for','on','at','by','with','from','and','or',
    'but','not','this','that','it','its','we','our','they','their','you','your',
    'plan','trip','travel','visit','want','need','going','days','day','nights',
    'night','budget','make','please','help','create','itinerary','schedule',
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

/**
 * Score a memory against extracted keywords.
 */
function scoreMemory(memory, keywords) {
  let score = 0;

  // Tag matches
  for (const kw of keywords) {
    for (const tag of memory.tags) {
      if (tag.includes(kw) || kw.includes(tag)) score += 3;
    }
  }

  // Content matches
  const contentText = [memory.title, memory.description, ...memory.content]
    .join(' ')
    .toLowerCase();

  for (const kw of keywords) {
    if (contentText.includes(kw)) score += 1;
  }

  // Boost by confidence and usage
  score *= (0.5 + memory.confidence * 0.5);
  score += Math.min(memory.usageCount || 0, 5) * 0.1;

  return score;
}

/**
 * Retrieve top-N relevant memories for a given input string.
 * @param {string} input
 * @param {number} topN
 * @returns {{ memories: Memory[], keywords: string[] }}
 */
export function retrieveRelevantMemories(input, topN = 5) {
  const all = getAllMemories();
  if (!all.length) return { memories: [], keywords: [] };

  const keywords = extractKeywords(input);
  if (!keywords.length) {
    // No keywords → return highest confidence memories
    return { memories: all.slice(0, topN), keywords: [] };
  }

  const scored = all
    .map(m => ({ memory: m, score: scoreMemory(m, keywords) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  const memories = scored.map(({ memory }) => memory);

  // Increment usage count for retrieved memories
  memories.forEach(m => updateMemoryUsage(m.id));

  return { memories, keywords };
}
