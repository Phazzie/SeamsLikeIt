# Refactoring & Architectural Improvement Ideas

This document contains ideas for larger-scale refactoring and architectural improvements that can be implemented in the future.

## 1. "Structured Generation" Pattern for AI Tools

**Problem:** Asking an LLM to generate a large, complex, and strictly-typed JSON object in a single call is inherently brittle and prone to syntax errors.

**Proposed Solution:**

Instead of one large prompt, we can break the task into a series of smaller, more reliable LLM calls. This "Structured Generation" pattern would involve creating an orchestrator tool that performs the following steps:

1.  **Generate Components:** Call the LLM with a prompt focused *only* on generating a list of components. The output is a simple, easy-to-parse JSON array of strings.
2.  **Generate Seams:** Call the LLM with the requirements and the list of components, asking it to define the seams between them. The output is another simple JSON array of objects.
3.  **Generate Rationale & Details (In Parallel):** For each component and seam, make parallel calls to the LLM to flesh out the details (description, purpose, etc.). This distributes the work and reduces the complexity of any single call.
4.  **Assemble the Final Plan:** Combine the results from the previous steps into the final `ProposedPlan` object. This final assembly is deterministic and happens in our code, not the LLM's, ensuring a valid final structure.

**Benefits:**

*   **Increased Reliability:** Smaller, focused prompts are less likely to result in malformed JSON.
*   **Easier Debugging:** If one step fails, we know exactly which prompt and which part of the generation process is the problem.
*   **Better Control:** Allows for more granular control over the temperature, prompts, and logic for each step of the generation process.
*   **Improved Performance:** The ability to run the detail-generation step in parallel can speed up the overall process.
