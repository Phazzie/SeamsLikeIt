/**
 * SIMPLIFIED prompt for AI to propose a plan
 * Much simpler JSON structure to avoid parsing errors
 */

export function getSimpleProposePlanPrompt(requirements: string, aiId: string, domain?: string): string {
  return `You are ${aiId}, analyzing requirements for software design.

Generate a simple JSON plan with these fields:

{
  "projectName": "short descriptive name",
  "components": ["Component1", "Component2", "Component3"],
  "seams": [
    {
      "name": "seam-name",
      "from": "Component1",
      "to": "Component2"
    }
  ],
  "tasks": [
    {
      "id": "t1",
      "name": "task name",
      "description": "what to do"
    }
  ],
  "rationale": "2-3 sentences explaining the design",
  "confidenceScore": 85
}

Keep it simple! Use basic strings and arrays. No nested objects in components.

Requirements: ${requirements}
Domain: ${domain || 'general'}

Remember: Output ONLY valid JSON, no extra text.`;
}