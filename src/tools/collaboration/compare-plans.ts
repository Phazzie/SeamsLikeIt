/**
 * Tool: seam_compare_plans
 * 
 * Compares two proposed plans from different AIs and calculates their agreement level.
 * This helps determine whether the plans are aligned enough to proceed or if
 * steelman arguments are needed.
 * 
 * REGENERATED: Fixed type annotation, improved MCP return format consistency
 */

import { ProposedPlan, AgreementAnalysis, ConflictType, Task } from '../../types/collaboration.js';
import { ComparePlansSchema } from '../../contracts/collaboration.js';

export async function comparePlansTool(args: unknown) {
  try {
    // Validate input with Zod schema
    const parseResult = ComparePlansSchema.safeParse(args);
    
    if (!parseResult.success) {
      return {
        content: [{
          type: 'text',
          text: `Validation error: ${parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
        }]
      };
    }
    
    const { planA, planB } = parseResult.data;

    // Calculate agreement analysis
    const analysis = calculateAgreement(planA as ProposedPlan, planB as ProposedPlan);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(analysis, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

function calculateAgreement(planA: ProposedPlan, planB: ProposedPlan): AgreementAnalysis {
  // Component-level analysis
  const componentAlignment = analyzeComponents(planA, planB);
  
  // Seam-level analysis
  const seamAlignment = analyzeSeams(planA, planB);
  
  // Architecture alignment (combination of components and seams)
  const architecturalAlignment = (componentAlignment + seamAlignment) / 2;
  
  // Task-level analysis
  const taskAgreement = analyzeTasks(planA, planB);
  
  // Calculate overall agreement
  const overallAgreement = (componentAlignment + seamAlignment + taskAgreement) / 3;
  
  // Detect conflicts
  const conflicts = detectConflicts(planA, planB);
  
  // Find agreed and disagreed tasks
  const { agreedTasks, disagreedTasks } = categorizeTaskAgreement(planA, planB);
  
  return {
    overallAgreement,
    agreedTasks,
    disagreedTasks,
    architecturalAlignment,
    seamAlignment,
    componentAlignment,
    conflicts
  };
}

function analyzeComponents(planA: ProposedPlan, planB: ProposedPlan): number {
  const componentsA = new Set(planA.architecture.map(a => a.component.name.toLowerCase()));
  const componentsB = new Set(planB.architecture.map(a => a.component.name.toLowerCase()));
  
  const intersection = new Set([...componentsA].filter(x => componentsB.has(x)));
  const union = new Set([...componentsA, ...componentsB]);
  
  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}

function analyzeSeams(planA: ProposedPlan, planB: ProposedPlan): number {
  const seamsA = new Set(planA.seams.map(s => normalizeSeamName(s.name)));
  const seamsB = new Set(planB.seams.map(s => normalizeSeamName(s.name)));
  
  const intersection = new Set([...seamsA].filter(x => seamsB.has(x)));
  const union = new Set([...seamsA, ...seamsB]);
  
  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}

function analyzeTasks(planA: ProposedPlan, planB: ProposedPlan): number {
  const tasksA = new Set(planA.tasks.map(t => t.name.toLowerCase()));
  const tasksB = new Set(planB.tasks.map(t => t.name.toLowerCase()));
  
  const intersection = new Set([...tasksA].filter(x => tasksB.has(x)));
  const union = new Set([...tasksA, ...tasksB]);
  
  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}

function categorizeTaskAgreement(planA: ProposedPlan, planB: ProposedPlan): { agreedTasks: Task[], disagreedTasks: Task[] } {
  const tasksAMap = new Map(planA.tasks.map(t => [t.name.toLowerCase(), t]));
  const tasksBMap = new Map(planB.tasks.map(t => [t.name.toLowerCase(), t]));
  
  const agreedTasks: Task[] = [];
  const disagreedTasks: Task[] = [];
  
  // Find agreed tasks (tasks that appear in both plans)
  for (const [name, taskA] of tasksAMap) {
    if (tasksBMap.has(name)) {
      agreedTasks.push(taskA);
    } else {
      disagreedTasks.push(taskA);
    }
  }
  
  // Add tasks from plan B that aren't in plan A to disagreed
  for (const [name, taskB] of tasksBMap) {
    if (!tasksAMap.has(name)) {
      disagreedTasks.push(taskB);
    }
  }
  
  return { agreedTasks, disagreedTasks };
}

function detectConflicts(planA: ProposedPlan, planB: ProposedPlan): ConflictType[] {
  const conflicts: ConflictType[] = [];
  
  // Check for fundamental philosophy mismatch
  const componentCountDiff = Math.abs(planA.architecture.length - planB.architecture.length);
  const maxComponents = Math.max(planA.architecture.length, planB.architecture.length);
  
  if (componentCountDiff > maxComponents * 0.5) {
    conflicts.push(ConflictType.FUNDAMENTAL_PHILOSOPHY_MISMATCH);
  }
  
  // Check for boundary overlap
  for (const archA of planA.architecture) {
    for (const archB of planB.architecture) {
      if (archA.component.name !== archB.component.name) {
        const responsibilityOverlap = calculateResponsibilityOverlap(
          archA.component.responsibilities,
          archB.component.responsibilities
        );
        
        if (responsibilityOverlap > 0.5) {
          conflicts.push(ConflictType.BOUNDARY_OVERLAP);
          break;
        }
      }
    }
    if (conflicts.includes(ConflictType.BOUNDARY_OVERLAP)) break;
  }
  
  // Check for technical approach differences
  const techApproachDifference = Math.abs(planA.seams.length - planB.seams.length) / 
    Math.max(planA.seams.length, planB.seams.length);
  
  if (techApproachDifference > 0.5) {
    conflicts.push(ConflictType.TECHNICAL_APPROACH);
  }
  
  return [...new Set(conflicts)]; // Remove duplicates
}

function calculateResponsibilityOverlap(respA: string[], respB: string[]): number {
  let overlapCount = 0;
  
  for (const rA of respA) {
    for (const rB of respB) {
      if (calculateTextSimilarity(rA.toLowerCase(), rB.toLowerCase()) > 0.7) {
        overlapCount++;
        break;
      }
    }
  }
  
  return overlapCount / Math.max(respA.length, respB.length);
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/));
  const words2 = new Set(text2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

function normalizeSeamName(name: string): string {
  return name.toLowerCase().replace(/[-_\s]/g, '');
}


// Export for testing
export { comparePlansTool as comparePlans };