/**
 * Contract schemas for AI collaboration tools
 */

import { z } from 'zod';

// Base schemas for common types
export const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  dependencies: z.array(z.string()).optional(),
  estimatedMinutes: z.number().positive().optional(),
  parallelizable: z.boolean(),
  componentId: z.string().optional()
});

export const ComponentDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.string(),
  responsibilities: z.array(z.string()),
  dependencies: z.array(z.string()).optional(),
  domainContext: z.string().optional()
});

// Field and Interface schemas matching sdd.ts
export const FieldDefinitionSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean(),
  description: z.string().optional(),
  constraints: z.array(z.string()).optional()
});

export const InterfaceDefinitionSchema = z.object({
  name: z.string(),
  fields: z.array(FieldDefinitionSchema),
  validation: z.array(z.object({
    field: z.string(),
    rule: z.string(),
    errorMessage: z.string()
  })).optional()
});

export const ErrorScenarioSchema = z.object({
  condition: z.string(),
  errorType: z.string(),
  handling: z.string(),
  userMessage: z.string().optional()
});

export const SeamDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  participants: z.object({
    producer: ComponentDefinitionSchema,
    consumer: ComponentDefinitionSchema
  }),
  dataFlow: z.object({
    input: InterfaceDefinitionSchema,
    output: InterfaceDefinitionSchema
  }),
  purpose: z.string(),
  businessRules: z.array(z.string()).optional(),
  errorScenarios: z.array(ErrorScenarioSchema).optional()
});

export const ComponentDesignSchema = z.object({
  component: ComponentDefinitionSchema,
  proposedSeams: z.array(z.string()),
  rationale: z.string()
});

// Complete ProposedPlan schema
export const ProposedPlanSchema = z.object({
  aiId: z.string(),
  projectName: z.string(),
  tasks: z.array(TaskSchema),
  architecture: z.array(ComponentDesignSchema),
  seams: z.array(SeamDefinitionSchema),
  rationale: z.string(),
  confidenceScore: z.number().min(0).max(100),
  timestamp: z.date().or(z.string().transform(s => new Date(s)))
});

// SteelmanArgument output schema
export const SteelmanArgumentOutputSchema = z.object({
  arguingAiId: z.string(),
  targetPlanId: z.string(),
  strengths: z.array(z.string()).min(3),
  edgeCasesHandled: z.array(z.string()),
  architecturalBenefits: z.array(z.string()),
  weaknessesAddressed: z.array(z.string()),
  overallAssessment: z.string(),
  strengthScore: z.number().min(0).max(100)
});

// SynthesizedPlan schema
export const SynthesizedPlanSchema = ProposedPlanSchema.extend({
  sourcePlans: z.array(z.string()),
  synthesisStrategy: z.enum(['MERGE', 'HYBRID', 'LAYERED', 'PHASE_BASED']),
  coherenceScore: z.number().min(0).max(100),
  simplicityScore: z.number().min(0).max(100),
  warnings: z.array(z.string()).optional()
});

// ConflictType enum
export const ConflictTypeEnum = z.enum([
  'FUNDAMENTAL_PHILOSOPHY_MISMATCH',
  'BOUNDARY_OVERLAP',
  'TECHNICAL_APPROACH',
  'TASK_ORDERING',
  'COMPONENT_BOUNDARIES',
  'SEAM_IDENTIFICATION'
]);

export const ProposePlanSchema = z.object({
  requirements: z.string().min(1).max(10000),
  aiId: z.string().optional().default('AI-Assistant'),
  domain: z.enum(['healthcare', 'ecommerce', 'fintech', 'general']).optional()
});

export const ComparePlansSchema = z.object({
  planA: ProposedPlanSchema,
  planB: ProposedPlanSchema
});

export const SteelmanArgumentSchema = z.object({
  targetPlanId: z.string(),
  targetPlan: ProposedPlanSchema,
  arguingAiId: z.string(),
  focusAreas: z.array(z.string()).optional()
});

export const SynthesizePlansSchema = z.object({
  planA: ProposedPlanSchema,
  planB: ProposedPlanSchema,
  steelmanA: SteelmanArgumentOutputSchema.partial().optional(),
  steelmanB: SteelmanArgumentOutputSchema.partial().optional(),
  synthesisStrategy: z.enum(['MERGE', 'HYBRID', 'LAYERED', 'PHASE_BASED']).optional()
});