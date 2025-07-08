/**
 * Tool: sdd_evolve_contract
 * 
 * Carefully evolve contracts while maintaining backward compatibility.
 * Contracts are immutable in production but can evolve with versioning.
 */

import { aiClient } from '../utils/ai-client.js';
import { getContractEvolutionPrompt } from '../prompts/evolve-contract.js';

export async function evolveContractTool(args: any) {
  try {
    const { project, contractId, proposedChanges, breakingChangeStrategy } = args;

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

    if (!contractId || typeof contractId !== 'string') {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Contract ID is required',
          },
        ],
      };
    }

    if (!proposedChanges || !Array.isArray(proposedChanges)) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Proposed changes array is required',
          },
        ],
      };
    }

    // Find the contract
    const contract = project.contracts?.find((c: any) => c.id === contractId);
    if (!contract) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Contract ${contractId} not found in project`,
          },
        ],
      };
    }

    // Find all components affected by this contract
    const affectedComponents = project.components?.filter((comp: any) => {
      return project.contracts?.some((c: any) => 
        c.id === contractId && 
        c.participants?.some((p: any) => p.componentId === comp.id)
      );
    }) || [];

    // Build the evolution prompt
    const prompt = getContractEvolutionPrompt({
      contract,
      proposedChanges,
      affectedComponents,
      breakingChangeStrategy: breakingChangeStrategy || 'version',
      project,
    });

    // Call AI to evolve the contract
    const result = await aiClient.complete({
      prompt,
      temperature: 0.3, // Low temperature for careful evolution
      maxTokens: 4000,
    });

    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Error evolving contract: ${result.error}`,
          },
        ],
      };
    }

    // Parse the evolution plan
    let evolutionPlan;
    try {
      evolutionPlan = JSON.parse(result.data!.content);
    } catch (parseError) {
      return {
        content: [
          {
            type: 'text',
            text: `Error parsing evolution plan: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          },
        ],
      };
    }

    // Update the project with the evolution plan
    const updatedProject = {
      ...project,
      contractEvolutions: [
        ...(project.contractEvolutions || []),
        {
          contractId,
          timestamp: new Date().toISOString(),
          proposedChanges,
          evolutionPlan,
          affectedComponents: affectedComponents.map((c: any) => c.id),
        },
      ],
      // Add new versioned contract if approved
      contracts: evolutionPlan.strategy === 'version' 
        ? [...project.contracts, evolutionPlan.newContract]
        : project.contracts.map((c: any) => 
            c.id === contractId ? evolutionPlan.evolvedContract : c
          ),
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
        breakingChanges: evolutionPlan.breakingChanges || [],
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

export interface EvolveContractArgs {
  project: any;
  contractId: string;
  proposedChanges: string[];
  breakingChangeStrategy?: 'version' | 'migrate' | 'deprecate';
}