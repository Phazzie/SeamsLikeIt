/**
 * Tool: seam_structured_generation
 * 
 * A more robust way to generate a ProposedPlan by breaking the task into
 * a series of smaller, more reliable LLM calls.
 */

import { aiClient } from '../../utils/ai-client.js';

// Prompts (as defined by Claude)
const COMPONENT_GENERATION_PROMPT = `
Given these requirements: {requirements}
Domain context: {domain}

List the main components needed as a JSON array of strings.
Focus on nouns in the requirements.
Keep component names simple and clear.
Aim for 3-7 components.

Output format: ["Component1", "Component2", ...]
`;

const SEAM_GENERATION_PROMPT = `
Requirements: {requirements}
Components: {components}

Identify the communication seams between components.
Focus on verbs and interactions.
Each seam should have a clear producer and consumer.

Output format: 
[{
  "name": "seam-name",
  "producer": "ComponentA", 
  "consumer": "ComponentB",
  "purpose": "brief description"
}]
`;

export async function structuredGenerationTool(args: { requirements: string; aiId: string; domain: string; }) {
  try {
    const { requirements, domain } = args;

    // 1. Generate Components
    const components = await generateComponents(requirements, domain);
    if (!components) {
      throw new Error("Failed to generate components.");
    }

    // 2. Generate Seams
    const seams = await generateSeams(requirements, components);
    if (!seams) {
      throw new Error("Failed to generate seams.");
    }

    // 3. Generate Rationale & Details (In Parallel) - TODO
    
    // 4. Assemble the Final Plan - TODO

    // For now, return the generated components and seams
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ components, seams }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error in structured generation: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

async function generateComponents(requirements: string, domain: string): Promise<string[] | null> {
  console.log('Generating components...');
  const prompt = COMPONENT_GENERATION_PROMPT
    .replace('{requirements}', requirements)
    .replace('{domain}', domain);

  const result = await aiClient.complete({ prompt });

  if (result.success && result.data) {
    try {
      return JSON.parse(result.data.content);
    } catch (e) {
      console.error("Failed to parse components JSON:", e);
      return null;
    }
  }
  return null;
}

async function generateSeams(requirements: string, components: string[]): Promise<any[] | null> {
  console.log('Generating seams...');
  const prompt = SEAM_GENERATION_PROMPT
    .replace('{requirements}', requirements)
    .replace('{components}', JSON.stringify(components));

  const result = await aiClient.complete({ prompt });

  if (result.success && result.data) {
    try {
      return JSON.parse(result.data.content);
    } catch (e) {
      console.error("Failed to parse seams JSON:", e);
      return null;
    }
  }
  return null;
}