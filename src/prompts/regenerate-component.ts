/**
 * Prompts for component regeneration
 * 
 * Implements SDD's "regeneration over debugging" philosophy
 */

export const REGENERATE_COMPONENT_PROMPT = `You are implementing SDD's regeneration philosophy.

MINDSET: "I don't debug because I can't debug. I regenerate from blueprints."

Your task is to regenerate a component from its contracts and blueprint, creating BETTER code than before.

REGENERATION RULES:
1. The new code must honor ALL existing contracts exactly
2. Internal implementation can be completely different
3. Apply the requested improvements
4. Make the code clearer and more maintainable
5. Follow the blueprint but improve where possible

THINK LIKE THIS:
- Contracts are promises that cannot be broken
- Implementation details are disposable
- If it's hard to understand, rewrite it simpler
- More explicit is better than clever

<reasoning_trace>
Before regenerating, consider:
1. What contracts must this component fulfill?
2. What was wrong with the previous implementation?
3. How can we make it simpler and clearer?
4. What patterns would make this more maintainable?
</reasoning_trace>

COMPONENT TO REGENERATE:
{componentDetails}

CONTRACTS TO HONOR:
{contractDetails}

ORIGINAL BLUEPRINT:
{blueprintDetails}

REASON FOR REGENERATION:
{regenerationReason}

REQUESTED IMPROVEMENTS:
{requestedImprovements}

Generate the new implementation as JSON with this structure:
{
  "code": "// Complete regenerated component code",
  "tests": "// Test cases for the component",
  "documentation": "// Updated documentation",
  "improvements_made": ["List of", "improvements applied"],
  "contracts_verified": ["List of", "contracts honored"]
}

REMEMBER: Regeneration is liberation. You're not fixing old code, you're creating better code that happens to fulfill the same contracts.`;

export interface RegenerationContext {
  component: any;
  contracts: any[];
  stub: any;
  reason: string;
  improvements: string[];
}

export function getRegenerationPrompt(context: RegenerationContext): string {
  const componentDetails = JSON.stringify(context.component, null, 2);
  const contractDetails = JSON.stringify(context.contracts, null, 2);
  const blueprintDetails = context.stub ? JSON.stringify(context.stub, null, 2) : 'No blueprint available';
  const regenerationReason = context.reason;
  const requestedImprovements = context.improvements.length > 0 
    ? context.improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')
    : 'No specific improvements requested - focus on clarity and maintainability';

  return REGENERATE_COMPONENT_PROMPT
    .replace('{componentDetails}', componentDetails)
    .replace('{contractDetails}', contractDetails)
    .replace('{blueprintDetails}', blueprintDetails)
    .replace('{regenerationReason}', regenerationReason)
    .replace('{requestedImprovements}', requestedImprovements);
}