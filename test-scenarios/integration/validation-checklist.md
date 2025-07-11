# AI Collaboration - QA Validation Checklist

## Compare Tool

- [ ] Does the tool correctly parse valid `planA` and `planB`?
- [ ] Does the tool reject malformed or invalid input?
- [ ] Is the `agreement` score calculated correctly based on component/seam overlap?
- [ ] Are `conflicts` correctly identified (e.g., `COMPONENT_BOUNDARIES`, `PHILOSOPHY_MISMATCH`)?
- [ ] Does the output schema match the expected format?

## Steelman Tool

- [ ] Does the tool correctly identify the strongest arguments for `planA`?
- [ ] Does the tool correctly identify the strongest arguments for `planB`?
- [ ] Does the tool avoid simply re-stating the 'philosophy' notes and instead generate novel arguments?
- [ ] Does the output provide a balanced view of both plans?
- [ ] Does the tool handle inputs where the plans are very similar?

## Synthesize Tool

### Strategy Selection
- [ ] Does the tool select `MERGE` for high-agreement plans?
- [ ] Does the tool select `HYBRID` or `PHASE_BASED` for complex but compatible plans?
- [ ] Does the tool recommend `STEELMAN` for high-conflict, philosophical disagreements?
- [ ] Does the tool `REJECT` plans with logical errors (e.g., circular dependencies)?
- [ ] Does the tool `REQUEST_CLARIFICATION` for vague requirements?

### Output Quality
- [ ] Is the synthesized architecture logically coherent?
- [ ] Are all components from the source plans accounted for (either included, merged, or explicitly discarded)?
- [ ] Are the `keyDecisions` clear, concise, and actionable?
- [ ] Are the `warnings` relevant and helpful for the user?
- [ ] For multi-round sessions, is the state correctly maintained between rounds?

## Overall Integration

- [ ] Is the output of `compare` a valid input for `synthesize`?
- [ ] Is the output of `compare` a valid input for `steelman`?
- [ ] Is the output of `steelman` a valid input for `synthesize`?
- [ ] Are errors propagated correctly through the workflow? (e.g., an error in `compare` prevents `synthesize` from running).
- [ ] Does the system handle the complete workflow described in `integration-plan.md` without crashing?
