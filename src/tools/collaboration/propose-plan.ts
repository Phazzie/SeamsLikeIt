/**
 * Tool: seam_propose_plan
 * 
 * Generates a comprehensive development plan using Seam-Driven Development methodology.
 * This tool follows the "generate, don't debug" principle - it creates clean plans from scratch.
 * 
 * REGENERATED: Fixed AIRequest interface usage - AI client handles optimization internally
 */

import { z } from 'zod';
import { aiClient } from '../../utils/ai-client.js';
import { ProposedPlanSchema } from '../../contracts/collaboration.js';

// Input validation schema
const InputSchema = z.object({
  requirements: z.string().min(1).max(10000),
  aiId: z.string().optional().default('AI-Assistant'),
  domain: z.enum(['healthcare', 'ecommerce', 'fintech', 'general']).optional()
});

// Enhanced prompt that ensures reliable JSON generation
function createPrompt(requirements: string, aiId: string, domain?: string): string {
  const domainContext = domain ? getDomainContext(domain) : getDomainContext('general');
  
  return `You are ${aiId}, an AI architect using Seam-Driven Development methodology.

Your task: Create a complete implementation plan for the given requirements.

${domainContext}

CRITICAL: You must generate valid JSON that exactly matches this structure:

{
  "aiId": "${aiId}",
  "projectName": "descriptive name based on requirements",
  "tasks": [
    {
      "id": "t1",
      "name": "task name",
      "description": "what this task does",
      "dependencies": [],
      "estimatedMinutes": 30,
      "parallelizable": true,
      "componentId": "comp1"
    }
  ],
  "architecture": [
    {
      "component": {
        "id": "comp1",
        "name": "Component Name",
        "purpose": "what this component does",
        "responsibilities": ["responsibility 1", "responsibility 2"],
        "dependencies": []
      },
      "proposedSeams": ["seam1"],
      "rationale": "why this component is needed"
    }
  ],
  "seams": [
    {
      "id": "seam1",
      "name": "Seam Name",
      "description": "what this seam connects",
      "participants": {
        "producer": {
          "id": "comp1",
          "name": "Component Name",
          "purpose": "what this component does",
          "responsibilities": ["responsibility 1"],
          "dependencies": []
        },
        "consumer": {
          "id": "comp2",
          "name": "Other Component",
          "purpose": "what this component does",
          "responsibilities": ["responsibility 1"],
          "dependencies": []
        }
      },
      "dataFlow": {
        "input": {
          "name": "RequestData",
          "fields": [
            {"name": "field1", "type": "string", "required": true}
          ]
        },
        "output": {
          "name": "ResponseData",
          "fields": [
            {"name": "result", "type": "string", "required": true}
          ]
        }
      },
      "purpose": "why this seam exists",
      "businessRules": ["rule 1"],
      "errorScenarios": [
        {
          "condition": "when this happens",
          "errorType": "ERROR_CODE",
          "handling": "how to handle it"
        }
      ]
    }
  ],
  "rationale": "overall approach and key decisions",
  "confidenceScore": 85,
  "timestamp": "${new Date().toISOString()}"
}

SEAM-DRIVEN DEVELOPMENT RULES:
1. Extract components from nouns in requirements
2. Extract seams from verbs between components  
3. Every cross-component interaction needs a seam
4. Use these questions to find ALL seams:
   - What happens when X fails? (error handling seams)
   - Who needs to know when Y changes? (notification seams)
   - What data does Z need? (data flow seams)
   - What needs scheduling? (temporal seams)
   - What needs approval? (workflow seams)
   - What needs auditing? (compliance seams)

REQUIREMENTS TO ANALYZE:
${requirements}

IMPORTANT REMINDERS:
- Every task must have a unique id (t1, t2, t3...)
- Every component must have a unique id (comp1, comp2...)
- Every seam must have a unique id (seam1, seam2...)
- Dependencies array can be empty []
- EstimatedMinutes is optional but helpful
- Confidence score should be 0-100
- Include error scenarios for every seam
- Rationale field is MANDATORY - explain your design

Generate the complete JSON plan now:`;
}

function getDomainContext(domain: string): string {
  const contexts: Record<string, string> = {
    healthcare: `HEALTHCARE CONTEXT:
- Patient privacy (HIPAA)
- Clinical workflows
- Insurance integrations
- Appointment scheduling
- Medical records
- Prescriptions`,
    
    ecommerce: `E-COMMERCE CONTEXT:
- Product catalog
- Shopping cart
- Payment processing
- Inventory management
- Order fulfillment
- Customer reviews`,
    
    fintech: `FINTECH CONTEXT:
- Transaction security
- Regulatory compliance
- Account management
- Payment workflows
- Financial reporting
- Audit trails`,
    
    general: `GENERAL CONTEXT:
- User authentication
- Data persistence
- Business logic
- External integrations
- Error handling
- Performance`
  };
  
  return contexts[domain] || contexts.general;
}

export async function proposePlanTool(args: unknown) {
  try {
    // 1. Validate input
    const validatedInput = InputSchema.parse(args);
    const { requirements, aiId, domain } = validatedInput;
    
    // 2. Create prompt
    const prompt = createPrompt(requirements, aiId, domain);
    
    // 3. Call AI (optimal parameters are handled internally by AIClient)
    const response = await aiClient.complete({
      prompt,
      temperature: 0.7,
      maxTokens: 4000
    });
    
    if (!response.success || !response.data) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${response.error || 'AI service failed to respond'}`
        }]
      };
    }
    
    // 4. Parse JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(response.data.content);
    } catch (parseError) {
      // Attempt repair with a more focused prompt
      const repairPrompt = `Fix this invalid JSON and return ONLY valid JSON:
${response.data.content}

Return ONLY the corrected JSON, no explanation.`;
      
      const repairResponse = await aiClient.complete({
        prompt: repairPrompt,
        temperature: 0.1,
        maxTokens: 4000
      });
      
      if (!repairResponse.success || !repairResponse.data) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Failed to generate valid JSON after repair attempt'
          }]
        };
      }
      
      try {
        parsedData = JSON.parse(repairResponse.data.content);
      } catch (secondError) {
        return {
          content: [{
            type: 'text',
            text: `Error: Unable to parse AI response as JSON - ${parseError instanceof Error ? parseError.message : String(parseError)}`
          }]
        };
      }
    }
    
    // 5. Validate against schema
    const validationResult = ProposedPlanSchema.safeParse(parsedData);
    
    if (!validationResult.success) {
      return {
        content: [{
          type: 'text',
          text: `Validation error: ${validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
        }]
      };
    }
    
    // 6. Return MCP-formatted response
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(validationResult.data, null, 2)
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

// Export for testing
export const _internal = {
  createPrompt,
  getDomainContext
};