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

import { z } from 'zod';

export const ComponentDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.string(),
  responsibilities: z.array(z.string()),
  dependencies: z.array(z.string()).optional(),
  domainContext: z.string().optional(),
});

export const SeamDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  participants: z.object({
    producer: ComponentDefinitionSchema,
    consumer: ComponentDefinitionSchema,
  }),
  dataFlow: z.object({
    input: z.object({
      name: z.string(),
      fields: z.array(z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean(),
        description: z.string().optional(),
        constraints: z.array(z.string()).optional(),
      })),
      validation: z.array(z.object({
        field: z.string(),
        rule: z.string(),
        errorMessage: z.string(),
      })).optional(),
    }),
    output: z.object({
      name: z.string(),
      fields: z.array(z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean(),
        description: z.string().optional(),
        constraints: z.array(z.string()).optional(),
      })),
      validation: z.array(z.object({
        field: z.string(),
        rule: z.string(),
        errorMessage: z.string(),
      })).optional(),
    }),
  }),
  purpose: z.string(),
  businessRules: z.array(z.string()).optional(),
  errorScenarios: z.array(z.object({
    condition: z.string(),
    errorType: z.string(),
    handling: z.string(),
    userMessage: z.string().optional(),
  })).optional(),
});

export interface ComponentDefinition extends z.infer<typeof ComponentDefinitionSchema> {}
export interface SeamDefinition extends z.infer<typeof SeamDefinitionSchema> {}


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