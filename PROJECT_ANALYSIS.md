# Project Analysis & Improvement Plan

This document provides a detailed analysis of the SeamsLikeIt project, outlining identified errors, architectural observations, and a plan for improvement.

## 1. Code-Level Errors & Fixes

The `npm run lint` command revealed several TypeScript errors. Here's a breakdown of each and how to fix them:

**A. `src/http-server.ts(48,44): error TS7030: Not all code paths return a value.`**

*   **Problem:** The main `try...catch` block in the `/tools/:toolName` endpoint doesn't have a return path in the `catch` block if the `result.content[0].text` can't be parsed into JSON.
*   **Fix:** Add a `return` statement in the inner `catch` block.

**B. `src/middleware/auth.ts(41,14): error TS2769: No overload matches this call.`**

*   **Problem:** The `jwt.sign` function has a very specific signature. The current code is passing an object for the `expiresIn` option where the function expects a direct value or a more specific callback.
*   **Fix:** The `expiresIn` property should be directly inside the options object passed to `jwt.sign`.

**C. `src/middleware/auth.ts(94,10): error TS7030: Not all code paths return a value.`**

*   **Problem:** The `authenticate` function has a `try...catch` block where the `catch` block handles some errors but doesn't explicitly return a value in all cases, leading to a potential undefined return.
*   **Fix:** Ensure all paths within the `catch` block of the `authenticate` function return a response.

**D. Unused Imports in `src/tools/collaboration/propose-plan.ts` and `src/types/collaboration.ts`**

*   **Problem:** Several types (`ComponentDesign`, `Task`, `SDDProject`) are imported but never used. This is a minor issue but indicates dead code.
*   **Fix:** Remove the unused imports.

## 2. Architectural & Design Observations

Here are some higher-level observations about the project's design and architecture:

**A. Frontend: Hardcoded API Calls & State Management**

*   **Observation:** The `SDDDashboard.tsx` component handles all API calls, state management, and rendering logic in one large file. The API endpoints (e.g., `/api/auth/login`) are hardcoded directly in the `fetch` calls.
*   **Potential Improvement:**
    *   **Create an API Client:** Centralize all frontend API calls into a dedicated client module (e.g., `src/lib/api.ts`). This makes the code more modular, easier to maintain, and simplifies error handling.
    *   **Use a State Management Library:** For an application of this complexity, a state management library like Zustand or Redux Toolkit would simplify state updates, reduce prop drilling, and make the component logic cleaner.
    *   **Component-Specific Logic:** Break down the `SDDDashboard` into smaller, more focused components (e.g., `Timeline`, `RequirementsForm`, `VisualizationPanel`).

**B. Backend: Redundant Server Implementations**

*   **Observation:** There are two main server entry points: `src/index.ts` (for stdio MCP) and `src/http-server.ts` (for HTTP). They register many of the same tools but in slightly different ways. The HTTP server also has its own separate authentication mechanism.
*   **Potential Improvement:**
    *   **Unify Tool Registration:** Create a single, shared module that registers all tools. Both the MCP and HTTP servers can then import and use this module, reducing code duplication.
    *   **Shared Authentication Logic:** The authentication and authorization logic in `src/middleware/auth.ts` is well-structured but is only used by the HTTP server. This logic could be adapted to be used by the MCP server as well, providing a consistent security model.

**C. Error Handling & Contracts**

*   **Observation:** The project defines a custom `SDDError` in `src/contracts/index.ts` but it's not used consistently. The `proposePlanTool`, for example, returns a simple object with an `error` string instead of throwing a structured `SDDError`.
*   **Potential Improvement:**
    *   **Consistent Error Handling:** Enforce the use of the `SDDError` class across all tools and services. This will create a predictable error contract for all API responses, making both frontend and backend error handling more robust.
    *   **Zod for Validation:** The `proposePlanTool` uses Zod for input validation, which is excellent. This pattern should be applied to *all* tool inputs to ensure data integrity.

**D. Configuration Management**

*   **Observation:** Configuration values like API keys and JWT secrets are accessed directly from `process.env`.
*   **Potential Improvement:**
    *   **Centralized Config Module:** Create a dedicated configuration module (e.g., `src/config.ts`) that reads all environment variables, provides default values, and exports them as a typed object. This makes configuration easier to manage and test.

## 3. Summary & Recommendations

The project is well-structured and ambitious, but it has several areas that could be improved. Here is a prioritized list of recommendations:

1.  **Fix the TypeScript Errors:** Address the errors found by `npm run lint` first. This will improve code quality and prevent potential runtime bugs.
2.  **Refactor the Frontend:** Create a dedicated API client and consider a state management library to make the frontend more robust and maintainable.
3.  **Unify the Backend:** Refactor the backend to share tool registration and authentication logic between the MCP and HTTP servers.
4.  **Standardize Error Handling:** Consistently use the `SDDError` class and Zod validation to create a more predictable and reliable API.
