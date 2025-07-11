/**
 * Prompt for AI to propose a complete plan for implementing requirements
 * using Seam-Driven Development methodology
 */

export function getProposePlanPrompt(requirements: string, aiId: string, domain?: string): string {
  const domainContext = domain ? getDomainContext(domain) : '';
  
  return `You are ${aiId}, an AI assistant helping to design software using Seam-Driven Development methodology.

TASK: Analyze the given requirements and propose a complete implementation plan.

${domainContext}

SEAM-DRIVEN DEVELOPMENT PRINCIPLES:
1. Identify components from nouns in requirements
2. Identify seams from verbs between components
3. Define clear boundaries and contracts
4. Make integration points explicit
5. Focus on clean separation of concerns

YOUR ANALYSIS SHOULD INCLUDE:

1. PROJECT NAME: A clear, descriptive name for the project
2. TASKS: Break down the implementation into specific tasks
   - Each task should have a unique ID (t1, t2, etc.)
   - Include task name and description
   - Mark which tasks can be done in parallel
   - Specify dependencies between tasks
   - Estimate time in minutes (optional)
   - Link tasks to components when relevant

3. ARCHITECTURE: Design the component architecture
   - Define each component with clear purpose and responsibilities
   - Identify which seams each component participates in
   - Provide rationale for your design decisions

4. SEAMS: Identify ALL integration points
   - Use the hidden seam detection questions:
     * What happens when X fails?
     * Who needs to know when Y changes?
     * What data does Z need from elsewhere?
     * What needs to happen on a schedule?
     * What requires human approval?
     * What needs to be audited?
   - Define producer and consumer for each seam
   - Specify data flow (input/output)
   - Include error scenarios

5. RATIONALE: This is a mandatory field. Explain your overall approach and key decisions. Do not leave this field empty.

6. CONFIDENCE SCORE: Rate your confidence in this plan (0-100)

HIDDEN SEAM PATTERNS TO CHECK:
- Authentication/Authorization seams
- Notification/Event seams
- Error handling seams
- Temporal/Scheduling seams
- Audit/Logging seams
- Cache invalidation seams
- Migration/Versioning seams
- Cleanup/Deletion seams

OUTPUT FORMAT: Return a JSON object with this structure:
{
  "projectName": "string",
  "tasks": [
    {
      "id": "string",
      "name": "string", 
      "description": "string",
      "dependencies": ["task_id"],
      "estimatedMinutes": number,
      "parallelizable": boolean,
      "componentId": "string"
    }
  ],
  "architecture": [
    {
      "component": {
        "id": "string",
        "name": "string",
        "purpose": "string",
        "responsibilities": ["string"],
        "dependencies": ["component_id"]
      },
      "proposedSeams": ["seam_id"],
      "rationale": "string"
    }
  ],
  "seams": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "participants": {
        "producer": { "id": "string", "name": "string", "purpose": "string", "responsibilities": ["string"] },
        "consumer": { "id": "string", "name": "string", "purpose": "string", "responsibilities": ["string"] }
      },
      "dataFlow": {
        "input": { "name": "string", "fields": [{"name": "string", "type": "string", "required": boolean}] },
        "output": { "name": "string", "fields": [{"name": "string", "type": "string", "required": boolean}] }
      },
      "purpose": "string",
      "businessRules": ["string"],
      "errorScenarios": [
        {
          "condition": "string",
          "errorType": "string", 
          "handling": "string"
        }
      ]
    }
  ],
  "rationale": "string",
  "confidenceScore": number
}

**IMPORTANT: You must include all of the following top-level fields in your response: projectName, tasks, architecture, seams, rationale, confidenceScore.**

Remember to use "json" in your response for proper formatting.

REQUIREMENTS TO ANALYZE:
${requirements}`
}

function getDomainContext(domain: string): string {
  const contexts: Record<string, string> = {
    healthcare: `HEALTHCARE DOMAIN CONTEXT:
- Patient data privacy (HIPAA compliance)
- Clinical workflows and approvals
- Insurance and billing integrations
- Appointment scheduling patterns
- Medical record management
- Prescription and medication tracking`,
    
    ecommerce: `E-COMMERCE DOMAIN CONTEXT:
- Product catalog management
- Shopping cart and checkout flows
- Payment processing and security
- Inventory management
- Order fulfillment and shipping
- Customer reviews and ratings
- Promotional campaigns`,
    
    fintech: `FINTECH DOMAIN CONTEXT:
- Transaction security and fraud detection
- Regulatory compliance (KYC, AML)
- Account management and balances
- Payment processing workflows
- Financial reporting requirements
- Audit trails and compliance`,
    
    general: `GENERAL DOMAIN CONTEXT:
- User authentication and authorization
- Data persistence and retrieval
- Business logic processing
- External integrations
- Error handling and recovery
- Performance and scalability`
  };
  
  return contexts[domain] || contexts.general;
}