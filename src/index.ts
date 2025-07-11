#!/usr/bin/env node
import 'dotenv/config';

/**
 * SeamsLikeIt MCP Server
 * 
 * An MCP server that implements Seam-Driven Development methodology.
 * Enables domain experts to build enterprise-quality applications by defining
 * clear contracts and component boundaries that AI can implement reliably.
 * 
 * Tools:
 * - seam_analyze_requirements: Transform requirements into Seam-Driven components
 * - seam_generate_contracts: Create TypeScript interfaces from seam definitions
 * - seam_create_stubs: Generate implementation blueprints
 * - seam_validate_integration: Test component communication
 * - seam_orchestrate_simple: Coordinate the complete Seam-Driven workflow
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { analyzeRequirementsTool } from './tools/analyze-requirements.js';
import { generateContractsTool } from './tools/generate-contracts.js';
import { createStubsTool } from './tools/create-stubs.js';
import { validateIntegrationTool } from './tools/validate-integration.js';
import { orchestrateSimpleTool } from './tools/orchestrate-simple.js';
import { regenerateComponentTool } from './tools/regenerate-component.js';
import { analyzeForRegenerationTool } from './tools/analyze-for-regeneration.js';
import { evolveContractTool } from './tools/evolve-contract.js';
import { orchestrateParallelTool } from './tools/orchestrate-parallel.js';
import { 
  proposePlanTool,
  comparePlansTool,
  steelmanArgumentTool,
  synthesizePlansTool
} from './tools/collaboration/index.js';
import { structuredGenerationTool } from './tools/collaboration/structured-generation.js';

const server = new Server(
  {
    name: 'seamslikeit',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'seam_analyze_requirements',
        description: 'Transform plain English requirements into Seam-Driven component and seam definitions',
        inputSchema: {
          type: 'object',
          properties: {
            requirements: {
              type: 'string',
              description: 'Plain English description of what needs to be built',
            },
            domain: {
              type: 'string',
              description: 'Optional domain context (healthcare, ecommerce, fintech, etc.)',
            },
          },
          required: ['requirements'],
        },
      },
      {
        name: 'seam_generate_contracts',
        description: 'Convert seam definitions into TypeScript interfaces with ContractResult<T> patterns',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'object',
              description: 'Seam-Driven project object with seams to generate contracts for',
            },
          },
          required: ['project'],
        },
      },
      {
        name: 'seam_create_stubs',
        description: 'Generate complete implementation files with comprehensive headers and detailed blueprints',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'object',
              description: 'Seam-Driven project object with contracts to create stubs for',
            },
          },
          required: ['project'],
        },
      },
      {
        name: 'seam_validate_integration',
        description: 'Test that components can communicate properly through their defined seams',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'object',
              description: 'Seam-Driven project object to validate',
            },
          },
          required: ['project'],
        },
      },
      {
        name: 'seam_orchestrate_simple',
        description: 'Coordinate the entire Seam-Driven workflow from requirements to ready-to-implement project',
        inputSchema: {
          type: 'object',
          properties: {
            requirements: {
              type: 'string',
              description: 'Plain English description of what needs to be built',
            },
            domain: {
              type: 'string',
              description: 'Optional domain context (healthcare, ecommerce, fintech, etc.)',
            },
            outputPath: {
              type: 'string',
              description: 'Path where to save the generated project files',
            },
          },
          required: ['requirements'],
        },
      },
      {
        name: 'seam_analyze_for_regeneration',
        description: 'Analyze project to identify components that should be regenerated rather than debugged',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'object',
              description: 'Seam-Driven project object to analyze',
            },
            issues: {
              type: 'array',
              description: 'List of reported issues or bugs',
              items: { type: 'string' },
            },
            codeSmells: {
              type: 'array',
              description: 'List of identified code smells',
              items: { type: 'string' },
            },
          },
          required: ['project'],
        },
      },
      {
        name: 'seam_regenerate_component',
        description: 'Regenerate a component from its contracts and blueprint (Seam-Driven refactoring)',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'object',
              description: 'Seam-Driven project containing the component',
            },
            componentId: {
              type: 'string',
              description: 'ID of the component to regenerate',
            },
            reason: {
              type: 'string',
              description: 'Why this component needs regeneration',
            },
            improvements: {
              type: 'array',
              description: 'Specific improvements to make during regeneration',
              items: { type: 'string' },
            },
          },
          required: ['project', 'componentId'],
        },
      },
      {
        name: 'seam_evolve_contract',
        description: 'Evolve contracts carefully with versioning and migration strategies',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'object',
              description: 'Seam-Driven project containing the contract',
            },
            contractId: {
              type: 'string',
              description: 'ID of the contract to evolve',
            },
            proposedChanges: {
              type: 'array',
              description: 'List of proposed changes to the contract',
              items: { type: 'string' },
            },
            breakingChangeStrategy: {
              type: 'string',
              enum: ['version', 'migrate', 'deprecate'],
              description: 'Strategy for handling breaking changes',
            },
          },
          required: ['project', 'contractId', 'proposedChanges'],
        },
      },
      {
        name: 'seam_orchestrate_parallel',
        description: 'Run Seam-Driven workflow in parallel for 30-40% speed improvement',
        inputSchema: {
          type: 'object',
          properties: {
            requirements: {
              type: 'string',
              description: 'Plain English description of what needs to be built',
            },
            domain: {
              type: 'string',
              description: 'Optional domain context (healthcare, ecommerce, fintech, etc.)',
            },
            outputPath: {
              type: 'string',
              description: 'Path where to save the generated project files',
            },
          },
          required: ['requirements'],
        },
      },
      {
        name: 'seam_propose_plan',
        description: 'AI independently analyzes requirements and proposes a complete plan with tasks, architecture, and seams',
        inputSchema: {
          type: 'object',
          properties: {
            requirements: {
              type: 'string',
              description: 'Plain English description of what needs to be built',
            },
            aiId: {
              type: 'string',
              description: 'Identifier for the AI creating this plan (e.g., "Claude", "Gemini")',
            },
            domain: {
              type: 'string',
              description: 'Optional domain context (healthcare, ecommerce, fintech, etc.)',
            },
          },
          required: ['requirements'],
        },
      },
      {
        name: 'seam_compare_plans',
        description: 'Compare two AI-generated plans and calculate their agreement level',
        inputSchema: {
          type: 'object',
          properties: {
            planA: {
              type: 'object',
              description: 'First plan to compare',
            },
            planB: {
              type: 'object',
              description: 'Second plan to compare',
            },
          },
          required: ['planA', 'planB'],
        },
      },
      {
        name: 'seam_steelman_argument',
        description: 'Generate a steelman argument where an AI argues why the OTHER AI\'s plan is better',
        inputSchema: {
          type: 'object',
          properties: {
            targetPlanId: {
              type: 'string',
              description: 'ID of the plan to argue for',
            },
            targetPlan: {
              type: 'object',
              description: 'The plan to create a steelman argument for',
            },
            arguingAiId: {
              type: 'string',
              description: 'ID of the AI making the argument',
            },
            focusAreas: {
              type: 'array',
              description: 'Specific areas of disagreement to focus on',
              items: { type: 'string' },
            },
          },
          required: ['targetPlanId', 'targetPlan', 'arguingAiId'],
        },
      },
      {
        name: 'seam_synthesize_plans',
        description: 'Merge the best ideas from two plans into a synthesized plan with coherence assessment',
        inputSchema: {
          type: 'object',
          properties: {
            planA: {
              type: 'object',
              description: 'First plan to synthesize',
            },
            planB: {
              type: 'object',
              description: 'Second plan to synthesize',
            },
            steelmanA: {
              type: 'object',
              description: 'Steelman argument for plan A',
            },
            steelmanB: {
              type: 'object',
              description: 'Steelman argument for plan B',
            },
            synthesisStrategy: {
              type: 'string',
              enum: ['MERGE', 'HYBRID', 'LAYERED', 'PHASE_BASED'],
              description: 'Strategy for synthesis',
            },
          },
          required: ['planA', 'planB'],
        },
      },
      {
        name: 'seam_structured_generation',
        description: 'Generate a ProposedPlan in a structured, multi-step way to improve reliability.',
        inputSchema: {
          type: 'object',
          properties: {
            requirements: {
              type: 'string',
              description: 'Plain English description of what needs to be built',
            },
            aiId: {
              type: 'string',
              description: 'Identifier for the AI creating this plan (e.g., "Claude", "Gemini")',
            },
            domain: {
              type: 'string',
              description: 'Optional domain context (healthcare, ecommerce, fintech, etc.)',
            },
          },
          required: ['requirements'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'seam_analyze_requirements':
        return await analyzeRequirementsTool(args);
      
      case 'seam_generate_contracts':
        return await generateContractsTool(args);
      
      case 'seam_create_stubs':
        return await createStubsTool(args);
      
      case 'seam_validate_integration':
        return await validateIntegrationTool(args);
      
      case 'seam_orchestrate_simple':
        return await orchestrateSimpleTool(args);
      
      case 'seam_analyze_for_regeneration':
        return await analyzeForRegenerationTool(args);
      
      case 'seam_regenerate_component':
        return await regenerateComponentTool(args);
      
      case 'seam_evolve_contract':
        return await evolveContractTool(args);
      
      case 'seam_orchestrate_parallel':
        return await orchestrateParallelTool(args);
      
      case 'seam_propose_plan':
        return await proposePlanTool(args);
      
      case 'seam_compare_plans':
        return await comparePlansTool(args);
      
      case 'seam_steelman_argument':
        return await steelmanArgumentTool(args);
      
      case 'seam_synthesize_plans':
        return await synthesizePlansTool(args);
      
      case 'seam_structured_generation':
        return await structuredGenerationTool(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
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
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SeamsLikeIt MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { server, CallToolRequestSchema };