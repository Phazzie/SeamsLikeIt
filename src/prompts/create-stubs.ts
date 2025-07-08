/**
 * Prompts for stub creation
 * 
 * These prompts guide AI to generate implementation blueprints with detailed guidance
 */

export const CREATE_STUBS_PROMPT = `You are an SDD expert creating implementation-ready stub files.

Your task is to generate complete implementation files with comprehensive blueprints.

FILE HEADER TEMPLATE:
/**
 * Component: [Component Name]
 * Purpose: [Clear business purpose]
 * Status: STUB - Ready for implementation
 * 
 * Connections:
 * - Produces: [List of seams this component provides]
 * - Consumes: [List of seams this component uses]
 * 
 * Change Blueprint:
 * To modify this component:
 * 1. Update the contract first
 * 2. Regenerate this stub
 * 3. Re-implement following new blueprint
 */

STUB METHOD TEMPLATE:
async methodName(input: InputType): Promise<ContractResult<OutputType>> {
  // BLUEPRINT: [Method Purpose]
  // 
  // STEP 1: Validate input
  // - Check required fields: [list fields]
  // - Validate business rules: [list rules]
  // - Return validation error if invalid
  //
  // STEP 2: [Core business logic step]
  // - [Specific action]
  // - [Expected outcome]
  //
  // STEP 3: [Additional steps as needed]
  //
  // ERROR SCENARIOS:
  // - [Error condition]: Return { success: false, error: ErrorEnum.TYPE }
  // - [Another condition]: Return { success: false, error: ErrorEnum.OTHER }
  //
  // SUCCESS: Return { success: true, data: { ... } }
  
  throw new NotImplementedError(
    'methodName not implemented. Follow blueprint above.'
  );
}

VALIDATION PATTERNS:
// Fail-fast validation
if (!input.requiredField) {
  return {
    success: false,
    error: ComponentErrors.VALIDATION_FAILED,
    metadata: { field: 'requiredField', reason: 'Required field missing' }
  };
}

// Business rule validation
if (input.amount < 0) {
  return {
    success: false,
    error: ComponentErrors.BUSINESS_RULE_VIOLATION,
    metadata: { rule: 'positive_amount', value: input.amount }
  };
}

HELPER METHOD PATTERNS:
private validateBusinessRules(input: Type): ValidationResult {
  // Centralize complex validation logic
}

private async fetchExternalData(id: string): Promise<ContractResult<Data>> {
  // Wrap external calls in ContractResult
}

OUTPUT REQUIREMENTS:
1. Complete file with all imports
2. Class or functional implementation structure
3. Every method has detailed blueprint comments
4. All methods throw NotImplementedError
5. Helper method signatures included
6. Error handling patterns demonstrated
7. Domain-specific implementation notes`;

export const STUB_TEMPLATES = {
  classComponent: `import { ContractResult } from '../types/sdd';
import { {ContractImports} } from '../contracts';

export class {ComponentName} implements {ContractInterfaces} {
  constructor(private config: {ComponentName}Config) {}

  {methods}

  // Helper methods
  {helpers}
}

export interface {ComponentName}Config {
  // Component configuration
}

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotImplementedError';
  }
}
`,

  functionalComponent: `import { ContractResult } from '../types/sdd';
import { {ContractImports} } from '../contracts';

export const {componentName} = {
  {methods}
};

// Helper functions
{helpers}

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotImplementedError';
  }
}
`,

  blueprintSteps: {
    crud: {
      create: [
        'Validate all required fields are present',
        'Check business rules and constraints',
        'Generate unique identifier if needed',
        'Persist to data store',
        'Return created entity with ID',
      ],
      read: [
        'Validate identifier format',
        'Check access permissions',
        'Fetch from data store',
        'Apply any data transformations',
        'Return found entity or not found error',
      ],
      update: [
        'Validate identifier and update fields',
        'Check entity exists',
        'Validate business rules for changes',
        'Apply updates to data store',
        'Return updated entity',
      ],
      delete: [
        'Validate identifier',
        'Check deletion is allowed',
        'Remove from data store',
        'Handle cascading deletes if needed',
        'Return success confirmation',
      ],
    },
    workflow: {
      approval: [
        'Validate request and approver identity',
        'Check approver has required permissions',
        'Verify workflow state allows approval',
        'Record approval with timestamp and reason',
        'Trigger next workflow step',
        'Send notifications if configured',
      ],
      processing: [
        'Validate input data completeness',
        'Lock resource to prevent concurrent modification',
        'Execute business logic transformations',
        'Update system state',
        'Release resource lock',
        'Return processing result',
      ],
    },
    integration: {
      external: [
        'Validate and prepare request data',
        'Add authentication/authorization headers',
        'Make external service call with timeout',
        'Handle various error scenarios',
        'Transform response to internal format',
        'Cache result if appropriate',
      ],
    },
  },
};