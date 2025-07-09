/**
 * Tool: sdd_analyze_requirements
 * 
 * Transforms plain English requirements into SDD-compliant component and seam definitions.
 * This is the entry point for non-technical users to describe what they want to build.
 */

import { SDDProject } from '../types/sdd.js';
import { aiClient } from '../utils/ai-client.js';
import { getAnalysisPrompt } from '../prompts/analyze-requirements.js';
import { AnalyzeRequirementsSchema, SDDError, ErrorCodes } from '../contracts/index.js';

export async function analyzeRequirementsTool(args: any) {
  try {
    // Validate input with Zod schema
    const parseResult = AnalyzeRequirementsSchema.safeParse(args);
    
    if (!parseResult.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Validation error: ${parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          },
        ],
      };
    }
    
    const { requirements, domain, analysisDepth } = parseResult.data;

    // Build the analysis prompt with domain context and depth
    const prompt = getAnalysisPrompt(requirements, domain);
    const depthInstructions = analysisDepth === 'comprehensive' 
      ? '\n\nProvide COMPREHENSIVE analysis with detailed edge cases, error handling, and performance considerations.'
      : analysisDepth === 'basic'
      ? '\n\nProvide BASIC analysis focusing on core functionality only.'
      : '';
    
    // Add the requirements to analyze
    const fullPrompt = `${prompt}\n\nREQUIREMENTS TO ANALYZE:\n${requirements}\n\nGenerate the SDD project structure:`;

    // Call AI to analyze requirements
    const result = await aiClient.complete({
      prompt: fullPrompt,
      temperature: 0.7,
      maxTokens: 4000,
    });

    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing requirements: ${result.error}`,
          },
        ],
      };
    }

    try {
      // Parse the AI response
      const project: SDDProject = JSON.parse(result.data!.content);
      
      // Validate the project structure
      const validation = validateProjectStructure(project);
      if (!validation.valid) {
        return {
          content: [
            {
              type: 'text',
              text: `Invalid project structure: ${validation.errors.join(', ')}`,
            },
          ],
        };
      }

      // Add metadata
      project.domain = domain;
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(project, null, 2),
          },
        ],
      };
    } catch (parseError) {
      return {
        content: [
          {
            type: 'text',
            text: `Error parsing AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          },
        ],
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

function validateProjectStructure(project: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!project.name) errors.push('Project name is required');
  if (!project.description) errors.push('Project description is required');
  if (!Array.isArray(project.components)) errors.push('Components must be an array');
  if (!Array.isArray(project.seams)) errors.push('Seams must be an array');

  // Validate components
  if (project.components) {
    project.components.forEach((comp: any, index: number) => {
      if (!comp.id) errors.push(`Component ${index} missing id`);
      if (!comp.name) errors.push(`Component ${index} missing name`);
      if (!comp.purpose) errors.push(`Component ${index} missing purpose`);
      if (!Array.isArray(comp.responsibilities)) {
        errors.push(`Component ${index} responsibilities must be an array`);
      }
    });
  }

  // Validate seams
  if (project.seams) {
    project.seams.forEach((seam: any, index: number) => {
      if (!seam.id) errors.push(`Seam ${index} missing id`);
      if (!seam.name) errors.push(`Seam ${index} missing name`);
      if (!seam.participants?.producer) errors.push(`Seam ${index} missing producer`);
      if (!seam.participants?.consumer) errors.push(`Seam ${index} missing consumer`);
      if (!seam.dataFlow?.input) errors.push(`Seam ${index} missing input definition`);
      if (!seam.dataFlow?.output) errors.push(`Seam ${index} missing output definition`);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export for testing
export { analyzeRequirementsTool as analyzeRequirements };