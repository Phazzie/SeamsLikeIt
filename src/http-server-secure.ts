/**
 * Secure HTTP Server for SDD MCP
 * With JWT auth, rate limiting, and WebSocket support
 */
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// Import all tools
import { analyzeRequirementsTool } from './tools/analyze-requirements.js';
import { generateContractsTool } from './tools/generate-contracts.js';
import { createStubsTool } from './tools/create-stubs.js';
import { validateIntegrationTool } from './tools/validate-integration.js';
import { orchestrateSimpleTool } from './tools/orchestrate-simple.js';
import { orchestrateParallelTool } from './tools/orchestrate-parallel.js';
import { regenerateComponentTool } from './tools/regenerate-component.js';
import { analyzeForRegenerationTool } from './tools/analyze-for-regeneration.js';
import { evolveContractTool } from './tools/evolve-contract.js';
import { 
  proposePlanTool,
  comparePlansTool,
  steelmanArgumentTool,
  synthesizePlansTool
} from './tools/collaboration/index.js';

// Import middleware and utilities
import { authenticate, rateLimiters, generateToken } from './middleware/auth.js';
import { progressTracker } from './websocket/progress-tracker.js';
import { SDDError, ErrorCodes } from './contracts/index.js';

// Tool registry
const tools = {
  sdd_analyze_requirements: analyzeRequirementsTool,
  sdd_generate_contracts: generateContractsTool,
  sdd_create_stubs: createStubsTool,
  sdd_validate_integration: validateIntegrationTool,
  sdd_orchestrate_simple: orchestrateSimpleTool,
  sdd_orchestrate_parallel: orchestrateParallelTool,
  sdd_regenerate_component: regenerateComponentTool,
  sdd_analyze_for_regeneration: analyzeForRegenerationTool,
  sdd_evolve_contract: evolveContractTool,
  // Collaboration tools (also accept seam_ prefix for consistency)
  seam_propose_plan: proposePlanTool,
  seam_compare_plans: comparePlansTool,
  seam_steelman_argument: steelmanArgumentTool,
  seam_synthesize_plans: synthesizePlansTool,
};

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiters.default); // Apply default rate limiting to all routes

// WebSocket handling
wss.on('connection', (ws) => {
  const sessionId = uuidv4();
  console.log(`WebSocket client connected: ${sessionId}`);
  
  // Send initial connection message
  ws.send(JSON.stringify({
    type: 'connected',
    sessionId,
    message: 'Connected to SDD progress tracker'
  }));
  
  // Subscribe to progress events for this session
  const progressHandler = (event: any) => {
    if (event.sessionId === sessionId) {
      ws.send(JSON.stringify(event));
    }
  };
  
  progressTracker.on('progress', progressHandler);
  
  ws.on('close', () => {
    console.log(`WebSocket client disconnected: ${sessionId}`);
    progressTracker.removeListener('progress', progressHandler);
  });
});

// Health check (no auth required)
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    tools: Object.keys(tools),
    version: '1.0.0',
    auth: 'JWT enabled',
    websocket: `ws://localhost:${PORT}`,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth endpoints
app.post('/auth/login', rateLimiters.auth, async (req, res) => {
  try {
    // In production, validate against database
    const { username, password } = req.body;
    
    // Demo validation
    if (username === 'demo' && password === 'demo123') {
      const token = generateToken('demo-user', ['execute_tools']);
      res.json({ 
        success: true,
        token,
        expiresIn: '1h'
      });
    } else {
      throw new SDDError('Invalid credentials', ErrorCodes.AUTH_ERROR, 401);
    }
  } catch (error) {
    const status = error instanceof SDDError ? error.statusCode : 500;
    res.status(status).json({
      success: false,
      error: error instanceof SDDError ? error.code : 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
});

// Tool execution endpoint
app.post('/tools/:toolName', authenticate, async (req, res) => {
  const { toolName } = req.params;
  const sessionId = req.headers['x-session-id'] as string || uuidv4();
  
  try {
    const tool = tools[toolName as keyof typeof tools];
    
    if (!tool) {
      throw new SDDError(
        `Unknown tool: ${toolName}`,
        ErrorCodes.TOOL_ERROR,
        404
      );
    }
    
    // Start progress tracking
    progressTracker.startTool(toolName, sessionId);
    
    // Execute tool with progress updates
    const result = await tool({
      ...req.body,
      __sessionId: sessionId,
      __onProgress: (progress: number, message?: string) => {
        progressTracker.updateProgress(toolName, sessionId, progress, message);
      }
    });
    
    // Complete progress tracking
    progressTracker.completeTool(toolName, sessionId, result);
    
    // Format response
    let data;
    if (result.content?.[0]?.text) {
      try {
        // Try to parse as JSON
        data = JSON.parse(result.content[0].text);
      } catch (e) {
        // If not JSON, return as plain text
        data = { message: result.content[0].text };
      }
    } else {
      data = result;
    }
    
    const response = {
      success: true,
      data,
      sessionId
    };
    
    res.json(response);
  } catch (error) {
    // Track error
    progressTracker.errorTool(
      toolName, 
      sessionId, 
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    // Send error response
    const status = error instanceof SDDError ? error.statusCode : 500;
    res.status(status).json({
      success: false,
      error: error instanceof SDDError ? error.code : 'TOOL_ERROR',
      message: error instanceof Error ? error.message : 'Tool execution failed',
      sessionId
    });
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.code || 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
🚀 SDD Secure HTTP Server
📍 HTTP: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
🔐 Auth: JWT authentication enabled
⚡ Rate limiting: Active
🛡️ Security: XSS protection, input validation

Demo credentials:
- Username: demo
- Password: demo123

Available endpoints:
- GET  /health           - Health check
- POST /auth/login       - Get JWT token  
- POST /tools/:toolName  - Execute tool (requires auth)
  `);
});