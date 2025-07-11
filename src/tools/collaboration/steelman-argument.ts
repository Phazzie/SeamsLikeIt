/**
 * Tool: seam_steelman_argument
 * 
 * Generates a steelman argument where an AI argues why the OTHER AI's plan
 * is better. This encourages finding the best aspects of each approach
 * rather than defending one's own position.
 * 
 * REGENERATED: Removed unused imports, fixed return format for MCP compliance
 */

import { aiClient } from '../../utils/ai-client.js';
import { getSteelmanPrompt } from '../../prompts/steelman-argument.js';
import { SteelmanArgumentSchema, SteelmanArgumentOutputSchema } from '../../contracts/collaboration.js';

export async function steelmanArgumentTool(args: unknown) {
  try {
    // Validate input with Zod schema
    const parseResult = SteelmanArgumentSchema.safeParse(args);
    
    if (!parseResult.success) {
      return {
        content: [{
          type: 'text',
          text: `Validation error: ${parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
        }]
      };
    }
    
    const { targetPlanId, targetPlan, arguingAiId, focusAreas } = parseResult.data;

    // Build the steelman prompt
    const prompt = getSteelmanPrompt(targetPlan, arguingAiId, focusAreas);

    // Call AI to generate steelman argument
    const result = await aiClient.complete({
      prompt,
      temperature: 0.7,
      maxTokens: 2000
    });

    if (!result.success) {
      return {
        content: [{
          type: 'text',
          text: `Error generating steelman argument: ${result.error}`
        }]
      };
    }

    try {
      // Parse the AI response
      const argumentData = JSON.parse(result.data!.content);
      
      // Create the SteelmanArgument object with required fields
      const steelmanArgument = {
        arguingAiId,
        targetPlanId,
        strengths: argumentData.strengths || [],
        edgeCasesHandled: argumentData.edgeCasesHandled || [],
        architecturalBenefits: argumentData.architecturalBenefits || [],
        weaknessesAddressed: argumentData.weaknessesAddressed || [],
        overallAssessment: argumentData.overallAssessment || '',
        strengthScore: argumentData.strengthScore || 80
      };
      
      // Validate using Zod schema
      const validation = SteelmanArgumentOutputSchema.safeParse(steelmanArgument);
      if (!validation.success) {
        return {
          content: [{
            type: 'text',
            text: `Invalid argument structure: ${validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(validation.data, null, 2)
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

// Export for testing
export { steelmanArgumentTool as steelmanArgument };