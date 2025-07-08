/**
 * Core SDD Types
 * 
 * These types define the foundation of the SDD methodology:
 * - ContractResult<T> for all cross-component communication
 * - Seam definitions for component boundaries
 * - Component and integration structures
 */

export interface ContractResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SeamDefinition {
  id: string;
  name: string;
  description: string;
  participants: {
    producer: ComponentDefinition;
    consumer: ComponentDefinition;
  };
  dataFlow: {
    input: InterfaceDefinition;
    output: InterfaceDefinition;
  };
  purpose: string;
  businessRules?: string[];
  errorScenarios?: ErrorScenario[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  purpose: string;
  responsibilities: string[];
  dependencies?: string[];
  domainContext?: string;
}

export interface InterfaceDefinition {
  name: string;
  fields: FieldDefinition[];
  validation?: ValidationRule[];
}

export interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  constraints?: string[];
}

export interface ValidationRule {
  field: string;
  rule: string;
  errorMessage: string;
}

export interface ErrorScenario {
  condition: string;
  errorType: string;
  handling: string;
  userMessage?: string;
}

export interface SDDProject {
  name: string;
  description: string;
  domain?: string;
  components: ComponentDefinition[];
  seams: SeamDefinition[];
  contracts?: GeneratedContract[];
  stubs?: GeneratedStub[];
  validationResults?: ValidationResult[];
}

export interface GeneratedContract {
  seamId: string;
  fileName: string;
  content: string;
  interfaces: string[];
}

export interface GeneratedStub {
  componentId: string;
  fileName: string;
  content: string;
  blueprintSections: BlueprintSection[];
}

export interface BlueprintSection {
  method: string;
  steps: string[];
  errorHandling: string[];
  performanceNotes?: string;
  securityNotes?: string;
}

export interface ValidationResult {
  seamId: string;
  passed: boolean;
  tests: TestResult[];
  integrationIssues?: string[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  scenario: string;
  errorMessage?: string;
}