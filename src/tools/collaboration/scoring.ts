/**
 * Scoring functions for evaluating plan simplicity and coherence
 */

import { ProposedPlan, SynthesizedPlan, SimplicityScoringFactors, CoherenceScoringFactors } from '../../types/collaboration.js';

/**
 * Calculate simplicity score for a plan (0-100)
 * Higher scores indicate simpler, more elegant designs
 */
export function calculateSimplicityScore(plan: ProposedPlan | SynthesizedPlan): number {
  const factors = getSimplicityFactors(plan);
  
  let score = 100;
  
  // Penalize too many components (over-engineering)
  if (factors.componentCount > 7) {
    score -= (factors.componentCount - 7) * 5;
  }
  
  // Penalize too many seams per component (chatty interfaces)
  if (factors.avgSeamsPerComponent > 3) {
    score -= (factors.avgSeamsPerComponent - 3) * 10;
  }
  
  // Penalize deep nesting (complex hierarchies)
  if (factors.maxNestingDepth > 3) {
    score -= (factors.maxNestingDepth - 3) * 15;
  }
  
  // Heavily penalize circular dependencies
  score -= factors.circularDependencies * 20;
  
  // Penalize multiple responsibility violations
  score -= factors.multipleResponsibilityViolations * 10;
  
  // Bonus for good ratios
  if (factors.componentCount >= 3 && factors.componentCount <= 5) {
    score += 5; // Optimal component count
  }
  
  if (factors.avgSeamsPerComponent >= 1 && factors.avgSeamsPerComponent <= 2) {
    score += 5; // Well-balanced seam distribution
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate coherence score for a plan (0-100)
 * Higher scores indicate more cohesive, well-integrated designs
 */
export function calculateCoherenceScore(plan: ProposedPlan | SynthesizedPlan): number {
  const factors = getCoherenceFactors(plan);
  
  let score = 
    factors.architecturalConsistency * 0.25 +
    factors.boundaryClarity * 0.25 +
    factors.responsibilitySeparation * 0.20 +
    factors.dataFlowSimplicity * 0.15 +
    factors.errorHandlingUniformity * 0.15;
  
  // Additional penalty for synthesized plans with warnings
  if ('warnings' in plan && plan.warnings && plan.warnings.length > 0) {
    score -= plan.warnings.length * 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate factors that contribute to simplicity
 */
function getSimplicityFactors(plan: ProposedPlan | SynthesizedPlan): SimplicityScoringFactors {
  const componentCount = plan.architecture.length;
  const seamCount = plan.seams.length;
  const avgSeamsPerComponent = seamCount / Math.max(componentCount, 1);
  
  // Calculate max nesting depth from component dependencies
  const maxNestingDepth = calculateMaxNestingDepth(plan.architecture);
  
  // Detect circular dependencies
  const circularDependencies = detectCircularDependencies(plan.architecture);
  
  // Count components with too many responsibilities
  const multipleResponsibilityViolations = plan.architecture.filter(
    arch => arch.component.responsibilities.length > 5
  ).length;
  
  return {
    componentCount,
    seamCount,
    avgSeamsPerComponent,
    maxNestingDepth,
    circularDependencies,
    multipleResponsibilityViolations
  };
}

/**
 * Calculate factors that contribute to coherence
 */
function getCoherenceFactors(plan: ProposedPlan | SynthesizedPlan): CoherenceScoringFactors {
  // Architectural consistency: Do components follow similar patterns?
  const architecturalConsistency = evaluateArchitecturalConsistency(plan);
  
  // Boundary clarity: Are component boundaries well-defined?
  const boundaryClarity = evaluateBoundaryClarity(plan);
  
  // Responsibility separation: Single responsibility principle
  const responsibilitySeparation = evaluateResponsibilitySeparation(plan);
  
  // Data flow simplicity: How straightforward is data movement?
  const dataFlowSimplicity = evaluateDataFlowSimplicity(plan);
  
  // Error handling uniformity: Consistent error patterns?
  const errorHandlingUniformity = evaluateErrorHandlingUniformity(plan);
  
  return {
    architecturalConsistency,
    boundaryClarity,
    responsibilitySeparation,
    dataFlowSimplicity,
    errorHandlingUniformity
  };
}

function calculateMaxNestingDepth(architecture: any[]): number {
  const depthMap: Map<string, number> = new Map();
  
  function getDepth(componentId: string): number {
    if (depthMap.has(componentId)) {
      return depthMap.get(componentId)!;
    }
    
    const component = architecture.find(a => a.component.id === componentId);
    if (!component || !component.component.dependencies || component.component.dependencies.length === 0) {
      depthMap.set(componentId, 1);
      return 1;
    }
    
    const maxDepth = Math.max(
      ...component.component.dependencies.map((depId: string) => getDepth(depId))
    ) + 1;
    
    depthMap.set(componentId, maxDepth);
    return maxDepth;
  }
  
  return Math.max(...architecture.map(a => getDepth(a.component.id)));
}

function detectCircularDependencies(architecture: any[]): number {
  const cycles = new Set<string>();
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCycle(componentId: string, path: string[] = []): boolean {
    visited.add(componentId);
    recursionStack.add(componentId);
    path.push(componentId);
    
    const component = architecture.find(a => a.component.id === componentId);
    if (component && component.component.dependencies) {
      for (const depId of component.component.dependencies) {
        if (!visited.has(depId)) {
          if (hasCycle(depId, [...path])) {
            return true;
          }
        } else if (recursionStack.has(depId)) {
          // Create a unique cycle identifier to avoid double counting
          const cycleStart = path.indexOf(depId);
          const cycle = path.slice(cycleStart).sort().join('-');
          cycles.add(cycle);
          return true;
        }
      }
    }
    
    recursionStack.delete(componentId);
    return false;
  }
  
  architecture.forEach(a => {
    if (!visited.has(a.component.id)) {
      hasCycle(a.component.id);
    }
  });
  
  return cycles.size;
}

function evaluateArchitecturalConsistency(plan: ProposedPlan | SynthesizedPlan): number {
  // Check if components follow similar naming patterns
  const namingConsistency = evaluateNamingConsistency(plan.architecture);
  
  // Check if responsibilities are distributed evenly
  const responsibilityDistribution = evaluateResponsibilityDistribution(plan.architecture);
  
  // Check if seam patterns are consistent
  const seamPatternConsistency = evaluateSeamPatternConsistency(plan.seams);
  
  return (namingConsistency + responsibilityDistribution + seamPatternConsistency) / 3;
}

function evaluateNamingConsistency(architecture: any[]): number {
  const namingPatterns = architecture.map(a => {
    const name = a.component.name;
    return {
      hasService: name.includes('Service'),
      hasManager: name.includes('Manager'),
      hasController: name.includes('Controller'),
      hasRepository: name.includes('Repository'),
      length: name.length
    };
  });
  
  // Count how many follow the most common pattern
  const patternCounts = { service: 0, manager: 0, controller: 0, repository: 0, other: 0 };
  namingPatterns.forEach(p => {
    if (p.hasService) patternCounts.service++;
    else if (p.hasManager) patternCounts.manager++;
    else if (p.hasController) patternCounts.controller++;
    else if (p.hasRepository) patternCounts.repository++;
    else patternCounts.other++;
  });
  
  const maxPattern = Math.max(...Object.values(patternCounts));
  return (maxPattern / architecture.length) * 100;
}

function evaluateResponsibilityDistribution(architecture: any[]): number {
  const responsibilityCounts = architecture.map(a => a.component.responsibilities.length);
  const avg = responsibilityCounts.reduce((a, b) => a + b, 0) / responsibilityCounts.length;
  const variance = responsibilityCounts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / responsibilityCounts.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation means more even distribution
  return Math.max(0, 100 - (stdDev * 20));
}

function evaluateSeamPatternConsistency(seams: any[]): number {
  if (seams.length === 0) return 100;
  
  // Check if seams follow consistent patterns
  const hasBusinessRules = seams.filter(s => s.businessRules && s.businessRules.length > 0).length;
  const hasErrorScenarios = seams.filter(s => s.errorScenarios && s.errorScenarios.length > 0).length;
  
  const businessRuleConsistency = (hasBusinessRules === 0 || hasBusinessRules === seams.length) ? 100 : 50;
  const errorScenarioConsistency = (hasErrorScenarios === 0 || hasErrorScenarios === seams.length) ? 100 : 50;
  
  return (businessRuleConsistency + errorScenarioConsistency) / 2;
}

function evaluateBoundaryClarity(plan: ProposedPlan | SynthesizedPlan): number {
  let score = 100;
  
  // Check for overlapping responsibilities between components
  for (let i = 0; i < plan.architecture.length; i++) {
    for (let j = i + 1; j < plan.architecture.length; j++) {
      const overlap = calculateResponsibilityOverlap(
        plan.architecture[i].component.responsibilities,
        plan.architecture[j].component.responsibilities
      );
      score -= overlap * 20; // Penalize overlaps
    }
  }
  
  return Math.max(0, score);
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

function evaluateResponsibilitySeparation(plan: ProposedPlan | SynthesizedPlan): number {
  const scores = plan.architecture.map(arch => {
    const respCount = arch.component.responsibilities.length;
    if (respCount <= 3) return 100;
    if (respCount <= 5) return 80;
    if (respCount <= 7) return 60;
    return 40;
  });
  
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function evaluateDataFlowSimplicity(plan: ProposedPlan | SynthesizedPlan): number {
  // Count average fields per seam
  const fieldCounts = plan.seams.map(seam => {
    const inputFields = seam.dataFlow.input.fields.length;
    const outputFields = seam.dataFlow.output.fields.length;
    return (inputFields + outputFields) / 2;
  });
  
  if (fieldCounts.length === 0) return 100;
  
  const avgFields = fieldCounts.reduce((a, b) => a + b, 0) / fieldCounts.length;
  
  // Ideal is 3-5 fields per seam
  if (avgFields >= 3 && avgFields <= 5) return 100;
  if (avgFields < 3) return 80; // Too simple might indicate missing data
  if (avgFields <= 8) return 70;
  if (avgFields <= 12) return 50;
  return 30; // Too complex
}

function evaluateErrorHandlingUniformity(plan: ProposedPlan | SynthesizedPlan): number {
  const errorPatterns = plan.seams.map(seam => {
    const scenarios = seam.errorScenarios || [];
    return {
      count: scenarios.length,
      types: new Set(scenarios.map((s: any) => s.errorType))
    };
  });
  
  if (errorPatterns.length === 0) return 100;
  
  // Check if all seams have similar error handling depth
  const counts = errorPatterns.map(p => p.count);
  const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((sum, count) => sum + Math.pow(count - avgCount, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance);
  
  return Math.max(0, 100 - (stdDev * 15));
}