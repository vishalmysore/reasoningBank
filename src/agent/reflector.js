/**
 * reflector.js — Extract reusable lessons from a completed travel plan
 * This is the most important module — it converts experience into memory.
 */
import { callLLM } from '../utils/llm.js';
import { createMemory } from '../memory/schema.js';

function buildReflectionPrompt(input, plan, reasoning) {
  return `You are a Travel Intelligence Analyst for a ReasoningBank AI system.

Your job is to extract ONE reusable, generalizable travel lesson from this completed trip planning session.

## Trip Request
${input}

## Generated Itinerary
${plan}

## Agent Reasoning
${reasoning || 'No reasoning recorded.'}

## Your Task
Extract a single, reusable travel insight or lesson. This should:
- Be generalized (not specific to just this user)
- Be useful for future travel planners in similar destinations or situations
- Focus on strategies, pitfalls, optimizations, or insights

Respond ONLY with valid JSON in this exact format:
{
  "title": "Short, memorable lesson title (max 10 words)",
  "description": "One clear sentence describing the lesson",
  "content": ["Key insight 1", "Key insight 2", "Key insight 3"],
  "tags": ["relevant", "destination", "or", "topic", "tags"],
  "confidence": 0.85
}`;
}

/**
 * Analyze a completed trip and extract a structured memory lesson.
 * @param {{ input, plan, reasoning }} tripData
 * @returns {Promise<Memory>}
 */
export async function reflectAndExtractLesson(tripData) {
  const { input, plan, reasoning } = tripData;
  const prompt = buildReflectionPrompt(input, plan, reasoning);
  const raw = await callLLM(prompt);

  try {
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    return createMemory({
      title:       parsed.title       || 'Travel Insight',
      description: parsed.description || '',
      content:     parsed.content     || [],
      tags:        parsed.tags        || [],
      confidence:  parsed.confidence  ?? 0.75,
    });
  } catch {
    // Fallback memory from raw text
    return createMemory({
      title:       'Travel Insight',
      description: 'Lesson extracted from recent trip',
      content:     [raw.slice(0, 200)],
      tags:        [],
      confidence:  0.5,
    });
  }
}
