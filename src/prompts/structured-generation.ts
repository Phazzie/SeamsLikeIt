/**
 * Focused prompts for the Structured Generation pattern
 * 
 * These prompts are designed to be small, focused, and reliable.
 * Each prompt has a single responsibility and clear output format.
 */

export const COMPONENT_GENERATION_PROMPT = `
You are an expert software architect analyzing requirements to identify components.

Given these requirements: {requirements}
Domain context: {domain}

List the main components needed as a JSON array of strings.
- Focus on nouns in the requirements (entities, services, managers)
- Keep component names simple and clear
- Use PascalCase for component names
- Aim for 3-7 components (more only if truly necessary)
- Each component should have a single responsibility

Example output for a blog system:
["User", "Post", "Comment", "AuthService", "NotificationService"]

Requirements: {requirements}

Output only the JSON array, no explanation:
`;

export const SEAM_GENERATION_PROMPT = `
You are an expert at identifying integration points between components.

Requirements: {requirements}
Available components: {components}

Identify the communication seams (integration points) between components.
- Focus on verbs and interactions in the requirements
- Each seam represents data flow or control flow
- Each seam must have a clear producer and consumer
- Include the purpose of each seam

Output format must be a JSON array:
[{
  "id": "unique-id",
  "name": "descriptive-name",
  "producer": "ComponentName",
  "consumer": "ComponentName",
  "purpose": "what this seam accomplishes"
}]

Example for blog system:
[{
  "id": "auth-user",
  "name": "user-authentication",
  "producer": "AuthService",
  "consumer": "User",
  "purpose": "Validates user credentials and creates sessions"
}]

Output only the JSON array:
`;

export const TASK_GENERATION_PROMPT = `
You are a project planner breaking down implementation into tasks.

Requirements: {requirements}
Components: {components}
Seams: {seams}

Generate implementation tasks as a JSON array.
Each task should be:
- Concrete and actionable
- Small enough to complete in 1-4 hours
- Properly sequenced (dependencies first)
- Marked as parallelizable when possible

Output format:
[{
  "id": "task-1",
  "name": "Short task name",
  "description": "What needs to be done",
  "dependencies": ["task-id-1", "task-id-2"],
  "parallelizable": true,
  "estimatedHours": 2
}]

Output only the JSON array:
`;

export const RATIONALE_GENERATION_PROMPT = `
You are explaining architectural decisions.

Requirements: {requirements}
Components: {components}
Seams: {seams}

Write a brief rationale (2-3 sentences) explaining:
1. Why this architecture was chosen
2. Key benefits of this approach
3. Any important trade-offs made

Keep it concise and focused on the "why".

Output only the rationale text, no JSON wrapper:
`;

export const COMPONENT_DETAILS_PROMPT = `
You are detailing a specific component's responsibilities.

Component name: {componentName}
Overall requirements: {requirements}
Related seams: {relatedSeams}

For this component, provide:
1. Primary responsibility (1 sentence)
2. Key methods/operations it should support (3-5 items)
3. Data it manages (if any)

Output format:
{
  "responsibility": "single sentence",
  "operations": ["operation1", "operation2"],
  "managedData": ["data1", "data2"] or []
}

Output only the JSON:
`;

export const SEAM_DETAILS_PROMPT = `
You are detailing a specific integration seam.

Seam: {seam}
Requirements context: {requirements}

For this seam, provide:
1. Data flow description (what data moves through)
2. Expected data format/structure
3. Error conditions to handle
4. Performance considerations (if any)

Output format:
{
  "dataFlow": "description",
  "dataFormat": "format description or example",
  "errorConditions": ["error1", "error2"],
  "performanceNotes": "notes or null"
}

Output only the JSON:
`;

// Helper function to fill in prompt templates
export function fillPrompt(template: string, values: Record<string, any>): string {
  let filled = template;
  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{${key}}`;
    const replacement = typeof value === 'object' ? JSON.stringify(value) : String(value);
    filled = filled.replace(new RegExp(placeholder, 'g'), replacement);
  }
  return filled;
}