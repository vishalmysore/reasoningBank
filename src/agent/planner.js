/**
 * planner.js — Generate travel itinerary using LLM + memory context
 */
import { callLLM } from '../utils/llm.js';

/**
 * Build the planner prompt, injecting past memories.
 */
function buildPlannerPrompt(request, memories) {
  const { destination, days, budget, preferences } = request;

  let memorySection = '';
  if (memories.length > 0) {
    memorySection = `\n## Past Travel Lessons (ReasoningBank Memory)\nUse these retrieved lessons to produce a better itinerary:\n\n${memories
      .map((m, i) => `[Lesson ${i + 1}] ${m.title}\n${m.description}\nKey insights: ${m.content.join('; ')}`)
      .join('\n\n')}\n`;
  }

  return `You are an expert AI Travel Planner with a ReasoningBank memory system.

## User Travel Request
- Destination: ${destination}
- Duration: ${days} days
- Budget: ${budget || 'flexible'}
- Preferences: ${preferences || 'none specified'}
${memorySection}
## Instructions
Generate a detailed, day-by-day travel itinerary. Apply the past lessons above to improve quality.

Respond ONLY with valid JSON in this exact format:
{
  "itinerary": "Full day-by-day travel plan as formatted text (use \\n for newlines)",
  "reasoning": "Brief explanation of key decisions and how past lessons influenced the plan",
  "assumptions": ["list", "of", "assumptions", "made"]
}`;
}

/**
 * Generate a travel plan.
 * @param {{ destination, days, budget, preferences }} request
 * @param {Memory[]} memories
 * @returns {Promise<{ itinerary, reasoning, assumptions }>}
 */
export async function generatePlan(request, memories) {
  const prompt = buildPlannerPrompt(request, memories);
  const raw = await callLLM(prompt);

  try {
    // Extract JSON from the response (handle markdown code blocks)
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    return {
      itinerary: parsed.itinerary || raw,
      reasoning: parsed.reasoning || '',
      assumptions: parsed.assumptions || [],
    };
  } catch {
    // Fallback: return raw text
    return {
      itinerary: raw,
      reasoning: '',
      assumptions: [],
    };
  }
}
