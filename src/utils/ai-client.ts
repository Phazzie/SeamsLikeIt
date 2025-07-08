/**
 * AI Client for SDD Tools
 * 
 * This module handles AI interactions for the SDD MCP server.
 * Supports both OpenAI API and mock responses for development.
 */

import { ContractResult } from '../types/sdd.js';
import OpenAI from 'openai';

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export class AIClient {
  private openai: OpenAI;

  constructor(config?: { apiKey?: string; baseUrl?: string }) {
    const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable.');
    }
    
    this.openai = new OpenAI({
      apiKey,
      baseURL: config?.baseUrl,
    });
  }

  async complete(request: AIRequest): Promise<ContractResult<AIResponse>> {
    try {
      // Validate request
      if (!request.prompt || request.prompt.trim().length === 0) {
        return {
          success: false,
          error: 'Prompt is required and cannot be empty',
        };
      }

      // Ensure prompt contains "json" for response_format requirement
      const userPrompt = request.prompt.toLowerCase().includes('json') 
        ? request.prompt 
        : `${request.prompt}\n\nRespond with valid JSON.`;

      // Use OpenAI API with optimized parameters
      const completion = await this.openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4-1106-preview',
        messages: [
          ...(request.systemPrompt ? [{ role: 'system' as const, content: request.systemPrompt }] : []),
          { role: 'user' as const, content: userPrompt },
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4000,
        response_format: { type: 'json_object' },
        // Advanced parameters for better results
        frequency_penalty: 0.1, // Reduce repetition
        presence_penalty: 0.1,  // Encourage diverse vocabulary
        top_p: 0.95,           // Nucleus sampling for creativity/accuracy balance
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return {
          success: false,
          error: 'No response from OpenAI',
        };
      }

      return {
        success: true,
        data: {
          content: response,
          usage: {
            promptTokens: completion.usage?.prompt_tokens || 0,
            completionTokens: completion.usage?.completion_tokens || 0,
          },
        },
        metadata: {
          model: completion.model,
          totalTokens: completion.usage?.total_tokens || 0,
          estimatedCost: this.calculateCost(
            completion.usage?.prompt_tokens || 0,
            completion.usage?.completion_tokens || 0,
            completion.model
          ),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `AI completion failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private calculateCost(promptTokens: number, completionTokens: number, model: string): number {
    // Pricing as of Jan 2025 (per 1M tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4o-mini-2024-07-18': { input: 0.15, output: 0.6 },
      'gpt-4o-mini': { input: 0.15, output: 0.6 },
      'gpt-4-1106-preview': { input: 10, output: 30 },
      'gpt-4': { input: 30, output: 60 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    };

    const modelPricing = pricing[model] || pricing['gpt-4-1106-preview'];
    const inputCost = (promptTokens / 1_000_000) * modelPricing.input;
    const outputCost = (completionTokens / 1_000_000) * modelPricing.output;
    
    return Math.round((inputCost + outputCost) * 100000) / 100000; // Round to 5 decimal places
  }

}

// Singleton instance
export const aiClient = new AIClient();