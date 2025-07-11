/**
 * Prompt for AI to synthesize two plans into a coherent combined plan
 */

import { SynthesisAssessment } from '../types/collaboration.js';

export function getSynthesisPrompt(
  planA: any,
  planB: any,
  steelmanA: any,
  steelmanB: any,
  synthesisStrategy?: string,
  viabilityAssessment?: SynthesisAssessment
): string {
  const strategyContext = getStrategyContext(synthesisStrategy);
  const viabilityContext = viabilityAssessment 
    ? `\n\nVIABILITY ASSESSMENT:\n${JSON.stringify(viabilityAssessment, null, 2)}\n`
    : '';
  
  const steelmanContext = (steelmanA && steelmanB)
    ? `\n\nSTEELMAN ARGUMENTS:
Plan A Strengths (according to ${planB.aiId}):
${steelmanA.strengths?.join('\n- ') || 'Not provided'}

Plan B Strengths (according to ${planA.aiId}):
${steelmanB.strengths?.join('\n- ') || 'Not provided'}`
    : '';
  
  return `You are tasked with synthesizing two AI-generated plans into a single coherent plan.

PLAN A (from ${planA.aiId}):
${JSON.stringify(planA, null, 2)}

PLAN B (from ${planB.aiId}):
${JSON.stringify(planB, null, 2)}

${steelmanContext}

${viabilityContext}

${strategyContext}

SYNTHESIS GUIDELINES:

1. PRESERVE BEST IDEAS: Identify and keep the strongest elements from each plan
   - Components with clearer boundaries
   - More elegant seam definitions
   - Better error handling
   - Superior task organization

2. RESOLVE CONFLICTS: When plans disagree, choose based on:
   - Architectural coherence
   - Simplicity (fewer components/seams when possible)
   - Clear separation of concerns
   - Scalability and maintainability

3. AVOID COMMON PITFALLS:
   - Don't just merge everything - that creates bloat
   - Don't create duplicate functionality
   - Don't mix incompatible architectural styles
   - Don't lose the coherence of either original plan

4. OPTIMIZE THE SYNTHESIS:
   - Eliminate redundancy
   - Consolidate similar components
   - Simplify overly complex seams
   - Ensure all tasks are necessary

5. MAINTAIN QUALITY:
   - The synthesized plan should be as good as or better than either original
   - It should feel like one coherent design, not two plans mashed together
   - Every decision should have clear justification

OUTPUT FORMAT: Return a JSON object with the complete plan structure:
{
  "projectName": "string",
  "tasks": [...],
  "architecture": [...],
  "seams": [...],
  "rationale": "Explain the synthesis approach and key decisions",
  "confidenceScore": number,
  "synthesisNotes": {
    "fromPlanA": ["list of key elements taken from Plan A"],
    "fromPlanB": ["list of key elements taken from Plan B"],
    "merged": ["list of elements that were combined/merged"],
    "excluded": ["list of elements intentionally left out and why"]
  }
}

Remember:
- Quality over quantity - a coherent subset is better than an incoherent whole
- The user can always choose an original plan if synthesis doesn't improve things
- Be honest about trade-offs in your rationale

Remember to use "json" in your response for proper formatting.`;
}

function getStrategyContext(strategy?: string): string {
  const strategies: Record<string, string> = {
    MERGE: `SYNTHESIS STRATEGY: MERGE
- Combine complementary components and seams
- Unify similar elements
- Preserve unique valuable features from each plan`,
    
    HYBRID: `SYNTHESIS STRATEGY: HYBRID
- Keep core architecture from the stronger plan
- Integrate specific innovations from the other plan
- Focus on compatibility over completeness`,
    
    LAYERED: `SYNTHESIS STRATEGY: LAYERED
- Use one plan as the base layer
- Add the other plan's components as a separate layer
- Connect layers through well-defined interfaces`,
    
    PHASE_BASED: `SYNTHESIS STRATEGY: PHASE-BASED
- Implement one plan first as Phase 1
- Add elements from the other plan as Phase 2
- Ensure phases can be developed independently`
  };
  
  return strategies[strategy || 'MERGE'] || strategies.MERGE;
}