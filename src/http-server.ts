/**
 * HTTP Server for SDD MCP
 * 
 * Enables remote access to the MCP server
 */
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { analyzeRequirementsTool } from './tools/analyze-requirements.js';
import { generateContractsTool } from './tools/generate-contracts.js';
import { createStubsTool } from './tools/create-stubs.js';
import { validateIntegrationTool } from './tools/validate-integration.js';
import { orchestrateSimpleTool } from './tools/orchestrate-simple.js';
import { orchestrateParallelTool } from './tools/orchestrate-parallel.js';
import { regenerateComponentTool } from './tools/regenerate-component.js';
import { analyzeForRegenerationTool } from './tools/analyze-for-regeneration.js';
import { evolveContractTool } from './tools/evolve-contract.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Simple API key authentication
const API_KEY = process.env.SDD_API_KEY || 'development-key';

const authenticate = (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    tools: 9,
    model: process.env.AI_MODEL || 'gpt-4o-mini'
  });
});

// Tool endpoints
app.post('/tools/:toolName', authenticate, async (req, res) => {
  const { toolName } = req.params;
  const args = req.body;
  
  try {
    let result;
    
    switch (toolName) {
      case 'analyze-requirements':
        result = await analyzeRequirementsTool(args);
        break;
      case 'generate-contracts':
        result = await generateContractsTool(args);
        break;
      case 'create-stubs':
        result = await createStubsTool(args);
        break;
      case 'validate-integration':
        result = await validateIntegrationTool(args);
        break;
      case 'orchestrate-simple':
        result = await orchestrateSimpleTool(args);
        break;
      case 'orchestrate-parallel':
        result = await orchestrateParallelTool(args);
        break;
      case 'analyze-for-regeneration':
        result = await analyzeForRegenerationTool(args);
        break;
      case 'regenerate-component':
        result = await regenerateComponentTool(args);
        break;
      case 'evolve-contract':
        result = await evolveContractTool(args);
        break;
      default:
        return res.status(404).json({ error: `Unknown tool: ${toolName}` });
    }
    
    // Extract the response
    if (result.content?.[0]?.text) {
      try {
        const data = JSON.parse(result.content[0].text);
        res.json({ 
          success: true, 
          data,
          metadata: result.metadata 
        });
      } catch {
        res.json({ 
          success: true, 
          data: result.content[0].text,
          metadata: result.metadata 
        });
      }
    } else {
      res.json({ success: false, error: 'No content returned' });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// List available tools
app.get('/tools', authenticate, (req, res) => {
  res.json({
    tools: [
      { name: 'analyze-requirements', description: 'Transform requirements into components and seams' },
      { name: 'generate-contracts', description: 'Create TypeScript interfaces from seams' },
      { name: 'create-stubs', description: 'Generate implementation blueprints' },
      { name: 'validate-integration', description: 'Test component communication' },
      { name: 'orchestrate-simple', description: 'Run complete SDD workflow' },
      { name: 'orchestrate-parallel', description: 'Run workflow in parallel (30% faster)' },
      { name: 'analyze-for-regeneration', description: 'Identify what needs regeneration' },
      { name: 'regenerate-component', description: 'Regenerate from contracts' },
      { name: 'evolve-contract', description: 'Evolve contracts with versioning' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SDD HTTP Server running on http://localhost:${PORT}`);
  console.log(`📝 API Key: ${API_KEY}`);
  console.log(`🔧 Tools available at POST /tools/:toolName`);
});