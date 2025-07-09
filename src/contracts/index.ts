/**
 * CENTRAL CONTRACT DEFINITIONS
 * These interfaces enable parallel development across all workstreams
 */

import { z } from 'zod';

// ===========================================
// TOOL INPUT SCHEMAS (Enables Stream 3 & 4)
// ===========================================

export const AnalyzeRequirementsSchema = z.object({
  requirements: z.string().min(1).max(10000),
  domain: z.enum(['healthcare', 'ecommerce', 'fintech', 'general']).optional(),
  analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed')
});

export const GenerateContractsSchema = z.object({
  components: z.array(z.object({
    name: z.string(),
    purpose: z.string(),
    dependencies: z.array(z.string())
  })),
  seams: z.array(z.object({
    from: z.string(),
    to: z.string(),
    contractName: z.string(),
    dataFlow: z.record(z.any())
  }))
});

export const OrchestrateSchema = z.object({
  requirements: z.string().min(1),
  domain: z.enum(['healthcare', 'ecommerce', 'fintech', 'general']).optional(),
  outputPath: z.string().optional(),
  parallel: z.boolean().default(false)
});

export const CreateStubsSchema = z.object({
  contracts: z.array(z.object({
    name: z.string(),
    version: z.string(),
    methods: z.array(z.any())
  })),
  components: z.array(z.object({
    name: z.string(),
    contracts: z.array(z.string())
  }))
});

export const ValidateIntegrationSchema = z.object({
  projectData: z.object({
    components: z.array(z.any()),
    seams: z.array(z.any()),
    contracts: z.array(z.any()).optional(),
    stubs: z.array(z.any()).optional()
  })
});

export const RegenerateComponentSchema = z.object({
  componentName: z.string(),
  contracts: z.array(z.any()),
  projectContext: z.object({
    architecture: z.string().optional(),
    dependencies: z.array(z.string()).optional()
  }).optional()
});

export const AnalyzeForRegenerationSchema = z.object({
  projectData: z.any(), // Complex nested structure
  changedFiles: z.array(z.string()).optional(),
  errorReports: z.array(z.object({
    component: z.string(),
    error: z.string()
  })).optional()
});

export const EvolveContractSchema = z.object({
  contractName: z.string(),
  currentVersion: z.object({
    version: z.string(),
    interface: z.any()
  }),
  proposedChanges: z.object({
    additions: z.array(z.any()).optional(),
    modifications: z.array(z.any()).optional(),
    deletions: z.array(z.string()).optional()
  }),
  strategy: z.enum(['extend', 'version', 'deprecate']).default('extend')
});

// ===========================================
// AUTH CONTRACTS (Enables Stream 1A)
// ===========================================

export interface AuthConfig {
  jwtSecret: string;
  tokenExpiry: string;
  refreshTokenExpiry: string;
  apiKeyHeader: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

export interface AuthenticatedRequest {
  userId: string;
  permissions: string[];
  apiKey?: string;
}

// ===========================================
// WEBSOCKET CONTRACTS (Enables Stream 2)
// ===========================================

export enum ProgressEventType {
  STARTED = 'started',
  PROGRESS = 'progress',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface ProgressEvent {
  type: ProgressEventType;
  toolName: string;
  sessionId: string;
  progress?: number;
  message?: string;
  data?: any;
  error?: string;
}

// ===========================================
// COST CONTROL CONTRACTS (Enables Stream 2)
// ===========================================

export interface CostConfig {
  maxDailySpend: number;
  maxRequestCost: number;
  warningThreshold: number;
  alertEmail?: string;
}

export interface CostTracker {
  getCurrentSpend(): Promise<number>;
  recordUsage(toolName: string, cost: number): Promise<void>;
  checkBudget(estimatedCost: number): Promise<boolean>;
}

// ===========================================
// PROVIDER ABSTRACTION (Enables Stream 3)
// ===========================================

export interface AIProvider {
  name: string;
  generateResponse(prompt: string, options?: AIOptions): Promise<AIResponse>;
  estimateCost(prompt: string): Promise<number>;
}

export interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
  };
  model: string;
}

// ===========================================
// UI CONTRACTS (Enables Stream 2)
// ===========================================

export interface UIToolRequest {
  toolName: string;
  parameters: Record<string, any>;
  sessionId: string;
  userId?: string;
}

export interface UIToolResponse {
  success: boolean;
  data?: any;
  error?: string;
  cost?: number;
  duration?: number;
}

// ===========================================
// ERROR CONTRACTS (Cross-cutting)
// ===========================================

export class SDDError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'SDDError';
  }
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  TOOL_ERROR: 'TOOL_ERROR'
} as const;