/**
 * Tool: sdd_regenerate_component
 * 
 * Implements SDD's "regeneration over debugging" philosophy.
 * When code is broken or needs refactoring, regenerate it from contracts.
 */

import { SDDProject } from '../types/sdd.js';
import { aiClient } from '../utils/ai-client.js';
import { getRegenerationPrompt } from '../prompts/regenerate-component.js';

export async function regenerateComponentTool(args: any) {
  try {
    const { project, componentId, reason, improvements } = args;

    // Validate inputs
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

    if (!componentId || typeof componentId !== 'string') {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Component ID is required',
          },
        ],
      };
    }

    // Find the component
    const component = project.components?.find((c: any) => c.id === componentId);
    if (!component) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Component ${componentId} not found in project`,
          },
        ],
      };
    }

    // Find all contracts this component participates in
    const relevantContracts = project.contracts?.filter((contract: any) => {
      return contract.participants?.some((p: any) => p.componentId === componentId);
    }) || [];

    // Find the stub/blueprint for this component
    const componentStub = project.stubs?.find((s: any) => s.componentId === componentId);

    // Build the regeneration prompt
    const prompt = getRegenerationPrompt({
      component,
      contracts: relevantContracts,
      stub: componentStub,
      reason: reason || 'Code needs improvement',
      improvements: improvements || [],
    });

    // Call AI to regenerate the component
    const result = await aiClient.complete({
      prompt,
      temperature: 0.3, // Lower temperature for more consistent regeneration
      maxTokens: 4000,
    });

    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Error regenerating component: ${result.error}`,
          },
        ],
      };
    }

    // Parse the regenerated code
    let regeneratedCode;
    try {
      regeneratedCode = JSON.parse(result.data!.content);
    } catch (parseError) {
      return {
        content: [
          {
            type: 'text',
            text: `Error parsing regenerated code: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          },
        ],
      };
    }

    // Update the project with the regenerated component
    const updatedProject = {
      ...project,
      regeneratedComponents: [
        ...(project.regeneratedComponents || []),
        {
          componentId,
          timestamp: new Date().toISOString(),
          reason,
          improvements,
          code: regeneratedCode.code,
          tests: regeneratedCode.tests,
          documentation: regeneratedCode.documentation,
        },
      ],
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(updatedProject, null, 2),
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

export interface RegenerateComponentArgs {
  project: SDDProject;
  componentId: string;
  reason?: string;
  improvements?: string[];
}