/**
 * travelAgent.js — Main orchestrator
 *
 * Full ReasoningBank loop:
 *   User Request → Retrieve Memories → Generate Plan → Save Trajectory
 *                → Reflect → Save Lesson → Return Result
 */
import { retrieveRelevantMemories } from './retriever.js';
import { generatePlan }             from './planner.js';
import { reflectAndExtractLesson }  from './reflector.js';
import { saveMemory, saveTrajectory } from '../memory/memoryStore.js';
import { createTrajectory }          from '../memory/schema.js';

/**
 * @typedef {Object} TripResult
 * @property {string}   itinerary        - Day-by-day plan text
 * @property {string}   reasoning        - Planner reasoning
 * @property {string[]} assumptions      - Planner assumptions
 * @property {Memory[]} memoriesUsed     - Memories injected into context
 * @property {string[]} keywords         - Keywords extracted from request
 * @property {Memory}   newLesson        - Newly learned memory
 * @property {Trajectory} trajectory     - Saved trajectory record
 * @property {string[]} steps            - Execution steps log (for UI)
 */

/**
 * runTrip — execute the full ReasoningBank travel agent loop
 * @param {{ destination, days, budget, preferences }} request
 * @param {(step: string) => void} onStep  — progress callback
 * @returns {Promise<TripResult>}
 */
export async function runTrip(request, onStep = () => {}) {
  const steps = [];
  const log = (msg) => { steps.push(msg); onStep(msg); };

  // ── Step 1: Retrieve relevant memories ────────────────────
  log('🔍 Searching ReasoningBank for relevant past experiences…');
  const { memories: memoriesUsed, keywords } = retrieveRelevantMemories(
    `${request.destination} ${request.preferences || ''}`,
    5
  );
  log(
    memoriesUsed.length > 0
      ? `📚 Found ${memoriesUsed.length} relevant memory(ies): ${memoriesUsed.map(m => m.title).join(', ')}`
      : '📭 No relevant memories found — starting fresh.'
  );

  // ── Step 2: Generate itinerary ────────────────────────────
  log('✈️  Generating travel plan with LLM…');
  const { itinerary, reasoning, assumptions } = await generatePlan(request, memoriesUsed);
  log('📋 Travel itinerary generated successfully.');

  // ── Step 3: Save trajectory ───────────────────────────────
  log('💾 Recording reasoning trajectory…');
  const trajectory = createTrajectory({
    input: JSON.stringify(request),
    plan:  itinerary,
    reasoningSteps: steps.slice(),
  });
  saveTrajectory(trajectory);
  log('✅ Trajectory saved to ReasoningBank.');

  // ── Step 4: Reflect and extract new lesson ────────────────
  log('🧠 Running reflection engine — extracting reusable lesson…');
  const newLesson = await reflectAndExtractLesson({
    input:     JSON.stringify(request),
    plan:      itinerary,
    reasoning: reasoning,
  });
  log(`✨ New lesson learned: "${newLesson.title}"`);

  // ── Step 5: Save lesson to memory ─────────────────────────
  saveMemory(newLesson);
  log('💡 New lesson stored in ReasoningBank memory.');

  return {
    itinerary,
    reasoning,
    assumptions,
    memoriesUsed,
    keywords,
    newLesson,
    trajectory,
    steps,
  };
}
