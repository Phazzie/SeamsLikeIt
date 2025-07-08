/**
 * Tool: sdd_analyze_for_regeneration
 * 
 * Analyzes code to identify components that should be regenerated
 * rather than debugged or refactored traditionally.
 */

import { aiClient } from '../utils/ai-client.js';

export async function analyzeForRegenerationTool(args: any) {
  try {
    const { project, issues, codeSmells } = args;

    if (!project || typeof project !== 'object') {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Valid project object is required',
          },
        ],
      };
    }

    const analysisPrompt = `You are an SDD regeneration advisor following the Marcus Principle.

PHILOSOPHY: "When something breaks, look at the blueprint and regenerate from scratch."

Analyze this project and identify components that should be REGENERATED rather than debugged.

PROJECT STRUCTURE:
${JSON.stringify(project, null, 2)}

REPORTED ISSUES:
${JSON.stringify(issues || [], null, 2)}

CODE SMELLS:
${JSON.stringify(codeSmells || [], null, 2)}

REGENERATION CRITERIA:
1. Integration issues between components (40-60% of debug time)
2. Complex bugs that cross component boundaries  
3. Code that's hard to understand or maintain
4. Components with multiple accumulated patches
5. Performance issues from accumulated complexity
6. Security vulnerabilities in component boundaries

For each component that should be regenerated, explain:
- Why regeneration is better than debugging
- What improvements to request during regeneration
- Expected time savings vs traditional debugging

Return a JSON array of regeneration recommendations:
{
  "recommendations": [
    {
      "componentId": "component-id",
      "componentName": "Component Name",
      "regenerationReason": "Why this should be regenerated",
      "symptoms": ["List of", "current issues"],
      "improvements": ["Specific improvements", "to request"],
      "estimatedTimeSaved": "2 hours vs debugging",
      "priority": "high|medium|low",
      "complexity": "simple|moderate|complex"
    }
  ],
  "summary": {
    "totalComponents": 5,
    "recommendedForRegeneration": 2,
    "estimatedTotalTimeSaved": "4 hours",
    "topReason": "Integration complexity"
  }
}`;

    const result = await aiClient.complete({
      prompt: analysisPrompt,
      temperature: 0.5,
      maxTokens: 3000,
    });

    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing for regeneration: ${result.error}`,
          },
        ],
      };
    }

    // Parse the analysis
    let analysis;
    try {
      analysis = JSON.parse(result.data!.content);
    } catch (parseError) {
      return {
        content: [
          {
            type: 'text',
            text: `Error parsing analysis: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(analysis, null, 2),
        },
      ],
      metadata: {
        cost: result.metadata?.estimatedCost || 0,
        tokensUsed: result.metadata?.totalTokens || 0,
      },
    };
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

export interface AnalyzeForRegenerationArgs {
  project: any;
  issues?: string[];
  codeSmells?: string[];
}