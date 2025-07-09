/**
 * AI Client Wrapper with Cost Tracking
 * Wraps the existing AI client to add cost tracking functionality
 */
import { aiClient } from './ai-client.js';
import { costTracker } from './cost-tracker.js';
import { SDDError, ErrorCodes } from '../contracts/index.js';

const MODEL_COSTS = {
  'gpt-4o-mini-2024-07-18': {
    input: 0.15 / 1_000_000,  // $0.15 per 1M tokens
    output: 0.60 / 1_000_000   // $0.60 per 1M tokens
  }
};

export async function completeWithCostTracking(params: any) {
  // Estimate cost (rough approximation)
  const estimatedTokens = (params.prompt?.length || 0) / 4; // ~4 chars per token
  const estimatedCost = estimatedTokens * MODEL_COSTS['gpt-4o-mini-2024-07-18'].input * 2; // x2 for output
  
  // Check budget before making request
  const budgetOk = await costTracker.checkBudget(estimatedCost);
  if (!budgetOk) {
    throw new SDDError(
      'Budget limit exceeded. Please check your daily spending limit.',
      ErrorCodes.BUDGET_EXCEEDED,
      429
    );
  }
  
  try {
    // Make the actual AI call
    const result = await aiClient.complete(params);
    
    // Calculate actual cost if usage info is available
    if (result.usage) {
      const actualCost = 
        (result.usage.promptTokens * MODEL_COSTS['gpt-4o-mini-2024-07-18'].input) +
        (result.usage.completionTokens * MODEL_COSTS['gpt-4o-mini-2024-07-18'].output);
      
      // Record the usage
      await costTracker.recordUsage(params.toolName || 'unknown', actualCost);
      
      // Add cost to result
      result.cost = actualCost;
    } else {
      // Record estimated cost if no usage data
      await costTracker.recordUsage(params.toolName || 'unknown', estimatedCost);
    }
    
    return result;
  } catch (error) {
    if (error instanceof SDDError) throw error;
    
    throw new SDDError(
      `AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCodes.PROVIDER_ERROR,
      500
    );
  }
}

// Export wrapped client with same interface
export const aiClientWithCost = {
  complete: completeWithCostTracking
};