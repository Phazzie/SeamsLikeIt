# AI Collaboration V2: Consensus-Based Development

## Core Innovation: Collaborative Planning & Steelman Arguments

### Phase 1: Collaborative Task Generation

```typescript
interface ProposedPlan {
  aiId: string;
  tasks: Task[];
  architecture: ComponentDesign[];
  rationale: string;
  confidenceScore: number;
}

interface AgreementAnalysis {
  overallAgreement: number; // 0-100%
  agreedTasks: Task[];
  disagreedTasks: Task[];
  architecturalAlignment: number;
}
```

### The Collaboration Flow

#### 1. Independent Analysis (Parallel)
Both AIs analyze the requirements independently:

```
Claude: seam_propose_plan --requirements "Build online bookstore"
Gemini: seam_propose_plan --requirements "Build online bookstore"
```

Output: Each AI produces a complete plan with tasks, architecture, and reasoning.

#### 2. Agreement Calculation
System automatically compares both plans:

```typescript
function calculateAgreement(plan1: ProposedPlan, plan2: ProposedPlan): AgreementAnalysis {
  // Compare:
  // - Component identification (did both identify User, Book, Cart?)
  // - Seam detection (did both find authentication, payment seams?)
  // - Task breakdown (similar subtasks?)
  // - Technical approach (same frameworks/patterns?)
  
  return {
    overallAgreement: 85, // percentage
    agreedTasks: [...], // what both identified
    disagreedTasks: [...], // unique to each
    architecturalAlignment: 78 // how similar the designs are
  };
}
```

#### 3. Decision Logic

**If Agreement >= 90%:**
- Use the plan with higher confidence score
- Minor differences merged automatically
- Proceed to implementation

**If Agreement < 90%:**
- Trigger Steelman Protocol

### The Steelman Protocol

Each AI must argue why THE OTHER AI's plan is better:

```
Claude: seam_steelman_argument --plan "gemini-plan-id" --focus "disagreed-areas"

"Gemini's approach to separate the Review service is superior because:
1. It creates cleaner seam boundaries
2. Reviews can scale independently
3. The notification seam Gemini identified handles the case I missed
4. Their task ordering prevents the circular dependency in my plan"

Gemini: seam_steelman_argument --plan "claude-plan-id" --focus "disagreed-areas"

"Claude's monolithic User service is actually better because:
1. Reduces inter-service communication overhead
2. User preferences and profile are tightly coupled
3. The authentication flow Claude designed is more secure
4. Their approach handles the session management edge case I overlooked"
```

### Resolution Mechanisms

After steelman arguments, the USER chooses the path:

```typescript
interface ResolutionOptions {
  planA: {
    plan: ProposedPlan;
    steelmanSupport: SteelmanArgument; // from other AI
    simplicityScore: number;
    coherenceScore: number; // how well it holds together
  };
  planB: {
    plan: ProposedPlan;
    steelmanSupport: SteelmanArgument;
    simplicityScore: number;
    coherenceScore: number;
  };
  synthesis?: {
    plan: SynthesizedPlan;
    simplicityScore: number;
    coherenceScore: number; // often lower due to merging
    warning?: string; // "Synthesis may increase complexity"
  };
}
```

The system presents all options with scores:

```
=== Resolution Options ===

Option A: Claude's Plan
- Simplicity Score: 92/100
- Coherence Score: 95/100  
- Gemini's Support: "Claude's approach is cleaner for MVP"
- Best for: Quick implementation, clear boundaries

Option B: Gemini's Plan  
- Simplicity Score: 78/100
- Coherence Score: 93/100
- Claude's Support: "Gemini caught critical billing requirements"
- Best for: Complete solution, future-proof

Option C: Synthesized Plan (AI-generated)
- Simplicity Score: 71/100 ⚠️
- Coherence Score: 82/100 ⚠️
- Warning: "Merging approaches may create awkward boundaries"
- Best for: When both plans have unique critical features

Option D: Custom Synthesis (User-guided)
- Let user pick specific components from each plan
- Maintains coherence by user's design choices

[Choose: A | B | C | D]
```

#### Key Insight: Coherence vs Completeness

Sometimes a coherent 80% solution (one plan) is better than an awkward 95% solution (synthesis). The system helps users understand this tradeoff.

### Simplicity/Elegance Scoring

```typescript
function calculateSimplicityScore(plan: Plan): number {
  // Factors that increase simplicity:
  const componentCount = plan.components.length;
  const seamCount = plan.seams.length;
  const avgSeamsPerComponent = seamCount / componentCount;
  const maxNestingDepth = calculateMaxDepth(plan.architecture);
  
  // Penalize:
  // - Too many components (over-engineering)
  // - Too many seams per component (chatty interfaces)  
  // - Deep nesting (complex hierarchies)
  // - Circular dependencies
  // - Multiple responsibility violations
  
  let score = 100;
  score -= (componentCount > 7) ? (componentCount - 7) * 5 : 0;
  score -= (avgSeamsPerComponent > 3) ? (avgSeamsPerComponent - 3) * 10 : 0;
  score -= (maxNestingDepth > 3) ? (maxNestingDepth - 3) * 15 : 0;
  score -= plan.circularDependencies.length * 20;
  
  return Math.max(0, score);
}
```

### When Synthesis Fails

The system detects when synthesis would be harmful:

```typescript
function assessSynthesisViability(planA: Plan, planB: Plan): SynthesisAssessment {
  const conflicts = findArchitecturalConflicts(planA, planB);
  
  if (conflicts.includes('FUNDAMENTAL_PHILOSOPHY_MISMATCH')) {
    return {
      viable: false,
      reason: "Plans have incompatible architectural philosophies",
      recommendation: "Choose one coherent vision"
    };
  }
  
  if (conflicts.includes('BOUNDARY_OVERLAP')) {
    return {
      viable: false,
      reason: "Component boundaries would create confusion",
      recommendation: "Pick the cleaner separation"
    };
  }
  
  // Calculate synthesis coherence
  const synthesisCoherence = calculateCoherence(mergePlans(planA, planB));
  const bestSingleCoherence = Math.max(planA.coherence, planB.coherence);
  
  if (synthesisCoherence < bestSingleCoherence * 0.85) {
    return {
      viable: true,
      warning: "Synthesis reduces architectural coherence by 15%+",
      recommendation: "Consider using one plan unless both features are critical"
    };
  }
  
  return { viable: true };
}
```

#### Option 2: A/B Testing
- Implement both approaches in parallel
- Use feature flags to test
- Let metrics decide

#### Option 3: Weighted Voting
```typescript
function resolveDisagreement(
  plan1: ProposedPlan,
  plan2: ProposedPlan,
  steelman1: SteelmanArgument,
  steelman2: SteelmanArgument
): FinalPlan {
  // Score based on:
  // - Original confidence
  // - Steelman argument strength
  // - Identification of edge cases
  // - Simplicity (Occam's razor)
  
  const score1 = plan1.confidence * 0.3 + 
                 steelman2.strengthScore * 0.4 + // Other AI's support
                 plan1.simplicityScore * 0.3;
                 
  const score2 = plan2.confidence * 0.3 + 
                 steelman1.strengthScore * 0.4 +
                 plan2.simplicityScore * 0.3;
                 
  return score1 > score2 ? synthesize(plan1, plan2) : synthesize(plan2, plan1);
}
```

#### Option 4: Human Arbitration
- Present both plans with steelman arguments
- Human makes informed decision
- System learns from choice for future

### Disagreement Categories

1. **Architectural Disagreements**
   - Component boundaries
   - Seam identification
   - Technology choices

2. **Task Order Disagreements**
   - Dependencies
   - Parallelization opportunities
   - Risk mitigation

3. **Implementation Detail Disagreements**
   - Specific algorithms
   - Data structures
   - Error handling approaches

### Example Collaboration Session

```
Human: "Build a patient scheduling system"

Claude's Plan:
- Components: Patient, Doctor, Appointment, Notification
- Key Seams: Availability checking, appointment booking, reminders
- 23 tasks, 3 parallel streams

Gemini's Plan:
- Components: Patient, Provider, Schedule, Notification, Billing
- Key Seams: Availability, booking, reminders, payment processing
- 28 tasks, 4 parallel streams

Agreement: 75% (Disagreement on Billing component and payment seams)

Claude's Steelman for Gemini:
"Gemini correctly identified that healthcare scheduling MUST handle billing.
The payment seam is critical for insurance verification and copays.
Separating Provider from Doctor allows for nurses/specialists."

Gemini's Steelman for Claude:
"Claude's simpler approach reduces initial complexity.
Billing could be added later as a separate phase.
The unified Doctor component is cleaner for MVP."

Resolution: Synthesis
- Use Claude's simpler architecture for MVP
- Add Gemini's billing as Phase 2
- Adopt Gemini's "Provider" naming (more inclusive)
- Keep payment seam in contracts but stub for now
```

### Benefits of This Approach

1. **Better Plans**: Two heads are better than one
2. **Learning**: AIs learn from each other's perspectives
3. **Robustness**: Catches edge cases one AI might miss
4. **Transparency**: Human can see the reasoning process
5. **Flexibility**: Multiple resolution paths

### Implementation Tools

```typescript
// New collaboration tools
seam_propose_plan         // Generate initial plan
seam_compare_plans        // Calculate agreement
seam_steelman_argument    // Argue for other's plan
seam_synthesize_plans     // Merge best ideas
seam_arbitrate           // Human decision interface
```

What do you think about this approach? The steelman arguments feel like they'd lead to much better outcomes than simple task division!