/**
 * AI Collaboration Types
 * 
 * These types enable multiple AIs to collaborate on Seam-Driven Development projects
 * using steelman arguments and consensus-based planning.
 */

import { ComponentDefinition, SeamDefinition } from './sdd.js';

export interface Task {
  id: string;
  name: string;
  description: string;
  dependencies?: string[];
  estimatedMinutes?: number;
  parallelizable: boolean;
  componentId?: string;
}

export interface ComponentDesign {
  component: ComponentDefinition;
  proposedSeams: string[];
  rationale: string;
}

export interface ProposedPlan {
  aiId: string;
  projectName: string;
  tasks: Task[];
  architecture: ComponentDesign[];
  seams: SeamDefinition[];
  rationale: string;
  confidenceScore: number;
  timestamp: Date;
}

export interface AgreementAnalysis {
  overallAgreement: number; // 0-100%
  agreedTasks: Task[];
  disagreedTasks: Task[];
  architecturalAlignment: number;
  seamAlignment: number;
  componentAlignment: number;
  conflicts: ConflictType[];
}

export enum ConflictType {
  FUNDAMENTAL_PHILOSOPHY_MISMATCH = 'FUNDAMENTAL_PHILOSOPHY_MISMATCH',
  BOUNDARY_OVERLAP = 'BOUNDARY_OVERLAP',
  TECHNICAL_APPROACH = 'TECHNICAL_APPROACH',
  TASK_ORDERING = 'TASK_ORDERING',
  COMPONENT_BOUNDARIES = 'COMPONENT_BOUNDARIES',
  SEAM_IDENTIFICATION = 'SEAM_IDENTIFICATION'
}

export interface SteelmanArgument {
  arguingAiId: string;
  targetPlanId: string;
  strengths: string[];
  edgeCasesHandled: string[];
  architecturalBenefits: string[];
  weaknessesAddressed: string[];
  overallAssessment: string;
  strengthScore: number; // 0-100
}

export interface SynthesizedPlan extends ProposedPlan {
  sourcePlans: string[];
  synthesisStrategy: 'MERGE' | 'HYBRID' | 'LAYERED' | 'PHASE_BASED';
  coherenceScore: number;
  simplicityScore: number;
  warnings?: string[];
}

export interface ResolutionOptions {
  planA: PlanOption;
  planB: PlanOption;
  synthesis?: SynthesisOption;
  customGuidance?: string;
}

export interface PlanOption {
  plan: ProposedPlan;
  steelmanSupport: SteelmanArgument;
  simplicityScore: number;
  coherenceScore: number;
  bestFor: string[];
}

export interface SynthesisOption {
  plan: SynthesizedPlan;
  simplicityScore: number;
  coherenceScore: number;
  warning?: string;
  viabilityAssessment: SynthesisAssessment;
}

export interface SynthesisAssessment {
  viable: boolean;
  reason?: string;
  recommendation: string;
  coherenceLoss?: number;
}

export interface CollaborationSession {
  id: string;
  requirements: string;
  plans: ProposedPlan[];
  agreementAnalysis?: AgreementAnalysis;
  steelmanArguments?: SteelmanArgument[];
  resolution?: ResolutionOptions;
  chosenPath?: 'A' | 'B' | 'SYNTHESIS' | 'CUSTOM';
  finalPlan?: ProposedPlan | SynthesizedPlan;
}

export interface SimplicityScoringFactors {
  componentCount: number;
  seamCount: number;
  avgSeamsPerComponent: number;
  maxNestingDepth: number;
  circularDependencies: number;
  multipleResponsibilityViolations: number;
}

export interface CoherenceScoringFactors {
  architecturalConsistency: number;
  boundaryClarity: number;
  responsibilitySeparation: number;
  dataFlowSimplicity: number;
  errorHandlingUniformity: number;
}
