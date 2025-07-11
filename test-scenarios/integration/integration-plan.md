# AI Collaboration Tools - Integration Test Plan

This document outlines the plan for integration testing of the AI collaboration tools.

## 1. Objectives
- Verify that the different collaboration tools (`analyze`, `compare`, `synthesize`, `steelman`) work together as a cohesive workflow.
- Ensure that the output of one tool serves as valid input for the next.
- Test the flow of data and state through a multi-round collaboration session.
- Validate the handling of different collaboration strategies (MERGE, HYBRID, REJECT, etc.).

## 2. Test Phases

### Phase 1: Basic Workflow Testing
- **Goal:** Test the end-to-end flow with a simple, successful scenario.
- **Scenario:** Use `basic/scenario-001-bookstore.json`.
- **Steps:**
  1. Feed `planA` and `planB` into the `compare` tool.
  2. Verify the output correctly identifies the high agreement level and low conflict.
  3. Feed the comparison result into the `synthesize` tool.
  4. Verify the synthesis result uses the `MERGE` strategy and produces a coherent, unified architecture.
  5. The final architecture should be logically sound and complete.

### Phase 2: Conflict Resolution Workflow
- **Goal:** Test the workflow involving significant disagreement and the `steelman` process.
- **Scenario:** Use `basic/scenario-003-inventory.json`.
- **Steps:**
  1. Feed `planA` (event-sourcing) and `planB` (CRUD) into the `compare` tool.
  2. Verify the output correctly identifies the `FUNDAMENTAL_PHILOSOPHY_MISMATCH`.
  3. Feed the comparison result into the `synthesize` tool.
  4. The synthesis tool should recognize the deep conflict and recommend the `steelman` process.
  5. Feed the original plans and the comparison result into the `steelman` tool.
  6. Verify the `steelman` tool correctly identifies the strongest arguments for both sides.
  7. Feed the `steelman` result back into the `synthesize` tool.
  8. Verify the final synthesis uses a `PHASE_BASED` or `HYBRID` approach as defined in the scenario's expectation.

### Phase 3: Multi-Round Session Testing
- **Goal:** Test the system's ability to handle a complex, iterative collaboration.
- **Scenario:** Use `complex/complex-001-marketplace.json`.
- **Steps:**
  1. **Round 1:** Execute the comparison and synthesis for the `round1` data.
  2. Verify the synthesized architecture from round 1 is stored and used as the input context for round 2.
  3. **Round 2:** Execute the comparison and synthesis for the `round2` data, using the output of round 1 as the base.
  4. Verify the system correctly modifies the existing architecture, not starting from scratch.
  5. **Round 3:** Repeat the process for `round3`.
  6. Verify the final architecture is a result of all three iterative rounds.

### Phase 4: Error Handling Integration
- **Goal:** Ensure that errors from one tool are gracefully handled by the next.
- **Scenario:** Use `errors/error-004-reference-errors.json`.
- **Steps:**
  1. Feed the plans into the `compare` tool.
  2. The `compare` tool's validation layer should detect the invalid reference and return a structured error.
  3. Feed this error result into the `synthesize` tool.
  4. The `synthesize` tool should refuse to process the input and propagate the error message, stating that synthesis cannot be performed on an invalid model.

## 3. API Sequence Testing
- Refer to `api-test-sequences.json` for specific, ordered API calls to simulate the above workflows.

## 4. QA Checklist
- Refer to `validation-checklist.md` for a detailed list of assertions to check at each step.
