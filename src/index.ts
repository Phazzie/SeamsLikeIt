#!/usr/bin/env node
import 'dotenv/config';

/**
 * SDD MCP Server
 * 
 * An MCP server that implements Software-Defined Development (SDD) methodology.
 * Enables domain experts to build enterprise-quality applications by defining
 * clear contracts and component boundaries that AI can implement reliably.
 * 
 * Tools:
 * - sdd_analyze_requirements: Transform requirements into SDD components
 * - sdd_generate_contracts: Create TypeScript interfaces from seam definitions
 * - sdd_create_stubs: Generate implementation blueprints
 * - sdd_validate_integration: Test component communication
 * - sdd_orchestrate_simple: Coordinate the complete SDD workflow
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

const server = new Server(
  {
    name: 'sdd-mcp-server',
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
        name: 'sdd_analyze_requirements',
        description: 'Transform plain English requirements into SDD-compliant component and seam definitions',
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
        name: 'sdd_generate_contracts',
        description: 'Convert seam definitions into TypeScript interfaces with ContractResult<T> patterns',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'object',
              description: 'SDD project object with seams to generate contracts for',
            },
          },
          required: ['project'],
        },
      },
      {
        name: 'sdd_create_stubs',
        description: 'Generate complete implementation files with comprehensive headers and detailed blueprints',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'object',
              description: 'SDD project object with contracts to create stubs for',
            },
          },
          required: ['project'],
        },
      },
      {
        name: 'sdd_validate_integration',
        description: 'Test that components can communicate properly through their defined seams',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'object',
              description: 'SDD project object to validate',
            },
          },
          required: ['project'],
        },
      },
      {
        name: 'sdd_orchestrate_simple',
        description: 'Coordinate the entire SDD workflow from requirements to ready-to-implement project',
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
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'sdd_analyze_requirements':
        return await analyzeRequirementsTool(args);
      
      case 'sdd_generate_contracts':
        return await generateContractsTool(args);
      
      case 'sdd_create_stubs':
        return await createStubsTool(args);
      
      case 'sdd_validate_integration':
        return await validateIntegrationTool(args);
      
      case 'sdd_orchestrate_simple':
        return await orchestrateSimpleTool(args);
      
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
  console.error('SDD MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});