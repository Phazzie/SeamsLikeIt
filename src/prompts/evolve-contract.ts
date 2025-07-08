/**
 * Prompts for contract evolution
 * 
 * Guides careful evolution of contracts with backward compatibility
 */

export const EVOLVE_CONTRACT_PROMPT = `You are a contract evolution specialist in Seam-Driven Development.

CONTEXT: In Seam-Driven Development, contracts are the promises between components. They should be immutable in production but can evolve carefully with proper versioning and migration strategies.

EVOLUTION PRINCIPLES:
1. Contracts are promises - breaking them breaks trust
2. Backward compatibility is paramount
3. Version rather than mutate when possible
4. Provide migration paths for breaking changes
5. Consider all affected components

<reasoning_trace>
Before evolving the contract, consider:
1. Is this change backward compatible?
2. Which components will be affected?
3. What's the migration strategy?
4. Can we version instead of modify?
5. What are the risks?
</reasoning_trace>

CURRENT CONTRACT:
{contractDetails}

PROPOSED CHANGES:
{proposedChanges}

AFFECTED COMPONENTS:
{affectedComponents}

BREAKING CHANGE STRATEGY: {breakingChangeStrategy}

Analyze the proposed changes and create an evolution plan with this JSON structure:
{
  "analysis": {
    "isBackwardCompatible": true/false,
    "breakingChanges": ["List of breaking changes"],
    "affectedOperations": ["List of affected operations"],
    "riskLevel": "low|medium|high"
  },
  "strategy": "version|migrate|extend",
  "evolvedContract": {
    // The evolved contract maintaining compatibility
  },
  "newContract": {
    // If versioning, the new version of the contract
  },
  "migrationPlan": {
    "steps": ["Step 1", "Step 2"],
    "timeline": "immediate|phased|coordinated",
    "rollbackStrategy": "Description of rollback"
  },
  "componentUpdates": [
    {
      "componentId": "component-id",
      "requiredChanges": ["List of changes"],
      "canRegenerate": true/false
    }
  ],
  "validationTests": [
    "Test to ensure compatibility",
    "Test to verify migration"
  ]
}

REMEMBER: Contracts are the treasure. Evolve them like you would cut a diamond - carefully, precisely, and with full awareness of the consequences.`;

export interface ContractEvolutionContext {
  contract: any;
  proposedChanges: string[];
  affectedComponents: any[];
  breakingChangeStrategy: string;
  project: any;
}

export function getContractEvolutionPrompt(context: ContractEvolutionContext): string {
  const contractDetails = JSON.stringify(context.contract, null, 2);
  const proposedChanges = context.proposedChanges.map((change, i) => `${i + 1}. ${change}`).join('\n');
  const affectedComponents = JSON.stringify(context.affectedComponents.map((c: any) => ({
    id: c.id,
    name: c.name,
    purpose: c.purpose
  })), null, 2);

  return EVOLVE_CONTRACT_PROMPT
    .replace('{contractDetails}', contractDetails)
    .replace('{proposedChanges}', proposedChanges)
    .replace('{affectedComponents}', affectedComponents)
    .replace('{breakingChangeStrategy}', context.breakingChangeStrategy);
}