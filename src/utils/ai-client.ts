/**
 * AI Client for SDD Tools
 * 
 * This module handles AI interactions for the SDD MCP server.
 * In a production environment, this would connect to an AI service.
 * For development, it provides structured mock responses.
 */

import { ContractResult } from '../types/sdd.js';

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
  private apiKey?: string;

  constructor(config?: { apiKey?: string; baseUrl?: string }) {
    this.apiKey = config?.apiKey || process.env.AI_API_KEY;
  }

  async complete(request: AIRequest): Promise<ContractResult<AIResponse>> {
    try {
      // In production, this would make an actual API call
      // For now, we'll return a mock response that demonstrates the pattern
      
      if (!this.apiKey && process.env.NODE_ENV === 'production') {
        return {
          success: false,
          error: 'AI API key not configured. Set AI_API_KEY environment variable.',
        };
      }

      // Mock response for development
      const mockResponse = this.generateMockResponse(request.prompt);
      
      return {
        success: true,
        data: {
          content: mockResponse,
          usage: {
            promptTokens: request.prompt.length / 4,
            completionTokens: mockResponse.length / 4,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `AI completion failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private generateMockResponse(prompt: string): string {
    // This is a simplified mock - in production, use actual AI
    if (prompt.includes('analyze requirements')) {
      return JSON.stringify({
        name: 'Sample Project',
        description: 'A sample SDD project',
        components: [
          {
            id: 'user-service',
            name: 'User Service',
            purpose: 'Manages user accounts and authentication',
            responsibilities: ['User registration', 'Authentication', 'Profile management'],
          },
          {
            id: 'product-service',
            name: 'Product Service',
            purpose: 'Manages product catalog',
            responsibilities: ['Product CRUD', 'Inventory tracking', 'Pricing'],
          },
        ],
        seams: [
          {
            id: 'user-product-access',
            name: 'User Product Access',
            description: 'Users accessing product information',
            participants: {
              producer: { id: 'product-service', name: 'Product Service' },
              consumer: { id: 'user-service', name: 'User Service' },
            },
            dataFlow: {
              input: {
                name: 'ProductRequest',
                fields: [
                  { name: 'userId', type: 'string', required: true },
                  { name: 'productId', type: 'string', required: true },
                ],
              },
              output: {
                name: 'ProductResponse',
                fields: [
                  { name: 'product', type: 'Product', required: false },
                  { name: 'accessGranted', type: 'boolean', required: true },
                ],
              },
            },
            purpose: 'Allow authenticated users to view product details',
          },
        ],
      });
    }

    return '{"error": "Mock response not implemented for this prompt type"}';
  }
}

// Singleton instance
export const aiClient = new AIClient();