/**
 * Tool: seam_synthesize_plans
 * 
 * Attempts to merge the best ideas from two plans into a synthesized plan.
 * Includes viability assessment to warn when synthesis might reduce coherence.
 * 
 * REGENERATED: Removed unused imports, fixed MCP return format
 */

import { ProposedPlan, SynthesisAssessment, ConflictType } from '../../types/collaboration.js';
import { aiClient } from '../../utils/ai-client.js';
import { getSynthesisPrompt } from '../../prompts/synthesize-plans.js';
import { SynthesizePlansSchema, SynthesizedPlanSchema } from '../../contracts/collaboration.js';
import { calculateSimplicityScore, calculateCoherenceScore } from './scoring.js';

export async function synthesizePlansTool(args: unknown) {
  try {
    // Validate input with Zod schema
    const parseResult = SynthesizePlansSchema.safeParse(args);
    
    if (!parseResult.success) {
      return {
        content: [{
          type: 'text',
          text: `Validation error: ${parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
        }]
      };
    }
    
    const { planA, planB, steelmanA, steelmanB, synthesisStrategy } = parseResult.data;

    // First assess if synthesis is viable
    const viabilityAssessment = assessSynthesisViability(
      planA as ProposedPlan, 
      planB as ProposedPlan
    );

    // Build the synthesis prompt
    const prompt = getSynthesisPrompt(
      planA,
      planB,
      steelmanA,
      steelmanB,
      synthesisStrategy,
      viabilityAssessment
    );

    // Call AI to synthesize plans
    const result = await aiClient.complete({
      prompt,
      temperature: 0.7,
      maxTokens: 4000
    });

    if (!result.success) {
      return {
        content: [{
          type: 'text',
          text: `Error synthesizing plans: ${result.error}`
        }]
      };
    }

    try {
      // Parse the AI response
      const synthesisData = JSON.parse(result.data!.content);
      
      // Create the SynthesizedPlan object
      const synthesizedPlanData = {
        ...synthesisData,
        aiId: 'synthesis',
        sourcePlans: [planA.aiId, planB.aiId],
        synthesisStrategy: synthesisStrategy || 'MERGE',
        timestamp: new Date(),
        coherenceScore: 0, // Will calculate
        simplicityScore: 0, // Will calculate
        warnings: synthesisData.warnings || []
      };
      
      // Validate with Zod schema before calculations
      const validationResult = SynthesizedPlanSchema.safeParse(synthesizedPlanData);
      if (!validationResult.success) {
        return {
          content: [{
            type: 'text',
            text: `Invalid synthesized plan structure: ${validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
          }]
        };
      }
      
      const synthesizedPlan = validationResult.data;
      
      // Calculate scores
      synthesizedPlan.simplicityScore = calculateSimplicityScore(synthesizedPlan);
      synthesizedPlan.coherenceScore = calculateCoherenceScore(synthesizedPlan);
      
      // Compare with original plans
      const originalMaxCoherence = Math.max(
        calculateCoherenceScore(planA as ProposedPlan),
        calculateCoherenceScore(planB as ProposedPlan)
      );
      
      if (synthesizedPlan.coherenceScore < originalMaxCoherence * 0.85) {
        synthesizedPlan.warnings = synthesizedPlan.warnings || [];
        synthesizedPlan.warnings.push(
          `Synthesis reduces architectural coherence by ${Math.round((1 - synthesizedPlan.coherenceScore / originalMaxCoherence) * 100)}%`
        );
      }
      
      // Add viability warnings
      if (!viabilityAssessment.viable) {
        synthesizedPlan.warnings = synthesizedPlan.warnings || [];
        synthesizedPlan.warnings.push(viabilityAssessment.reason || 'Synthesis may not be optimal');
      }
      
      // Create the complete response
      const response = {
        synthesizedPlan,
        viabilityAssessment,
        originalScores: {
          planA: {
            simplicity: calculateSimplicityScore(planA as ProposedPlan),
            coherence: calculateCoherenceScore(planA as ProposedPlan)
          },
          planB: {
            simplicity: calculateSimplicityScore(planB as ProposedPlan),
            coherence: calculateCoherenceScore(planB as ProposedPlan)
          }
        }
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (parseError) {
      return {
        content: [{
          type: 'text',
          text: `Error parsing AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

function assessSynthesisViability(planA: ProposedPlan, planB: ProposedPlan): SynthesisAssessment {
  const conflicts = detectConflicts(planA, planB);
  
  if (conflicts.includes(ConflictType.FUNDAMENTAL_PHILOSOPHY_MISMATCH)) {
    return {
      viable: false,
      reason: 'Plans have incompatible architectural philosophies',
      recommendation: 'Choose one coherent vision rather than forcing a synthesis'
    };
  }
  
  if (conflicts.includes(ConflictType.BOUNDARY_OVERLAP)) {
    return {
      viable: false,
      reason: 'Component boundaries would create confusion in synthesized plan',
      recommendation: 'Pick the plan with cleaner separation of concerns'
    };
  }
  
  // Calculate potential coherence loss
  const avgComponents = (planA.architecture.length + planB.architecture.length) / 2;
  const avgSeams = (planA.seams.length + planB.seams.length) / 2;
  const estimatedSynthesisComponents = avgComponents * 1.2; // Synthesis often adds complexity
  const estimatedSynthesisSeams = avgSeams * 1.3;
  
  const complexityIncrease = (estimatedSynthesisComponents + estimatedSynthesisSeams) / (avgComponents + avgSeams);
  
  if (complexityIncrease > 1.5) {
    return {
      viable: true,
      reason: 'Synthesis may significantly increase complexity',
      recommendation: 'Consider if all features from both plans are truly necessary',
      coherenceLoss: (complexityIncrease - 1) * 30 // Rough estimate
    };
  }
  
  return {
    viable: true,
    recommendation: 'Synthesis appears viable - proceed with careful integration'
  };
}

function detectConflicts(planA: ProposedPlan, planB: ProposedPlan): ConflictType[] {
  const conflicts: ConflictType[] = [];
  
  // Check for philosophy mismatch
  const componentsA = planA.architecture.length;
  const componentsB = planB.architecture.length;
  
  if (Math.abs(componentsA - componentsB) > Math.max(componentsA, componentsB) * 0.5) {
    conflicts.push(ConflictType.FUNDAMENTAL_PHILOSOPHY_MISMATCH);
  }
  
  // Check for boundary overlap
  for (const archA of planA.architecture) {
    for (const archB of planB.architecture) {
      if (archA.component.name !== archB.component.name) {
        const overlap = calculateResponsibilityOverlap(
          archA.component.responsibilities,
          archB.component.responsibilities
        );
        if (overlap > 0.5) {
          conflicts.push(ConflictType.BOUNDARY_OVERLAP);
          break;
        }
      }
    }
    if (conflicts.includes(ConflictType.BOUNDARY_OVERLAP)) break;
  }
  
  return conflicts;
}

function calculateResponsibilityOverlap(respA: string[], respB: string[]): number {
  let overlapCount = 0;
  for (const rA of respA) {
    for (const rB of respB) {
      if (calculateTextSimilarity(rA.toLowerCase(), rB.toLowerCase()) > 0.7) {
        overlapCount++;
        break;
      }
    }
  }
  return overlapCount / Math.max(respA.length, respB.length);
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/));
  const words2 = new Set(text2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

// Export for testing
export { synthesizePlansTool as synthesizePlans };