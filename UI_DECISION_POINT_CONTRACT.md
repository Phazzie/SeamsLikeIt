# UI Decision Point Contract

This document defines the UI/UX and contract for the critical user decision point in the collaboration workflow.

## 1. User Experience Goals

*   **Clarity:** The user must be able to easily understand the differences between the two proposed plans.
*   **Confidence:** The user should feel confident in their final decision, supported by the AI's analysis.
*   **Control:** The user must have the final say, with the ability to override the AI's recommendation.

## 2. Visual Layout & Mockup

The decision point screen will be divided into three main sections:

1.  **Plan A Column (Left):**
    *   Displays the key details of Plan A.
    *   Includes a summary of the plan's rationale and confidence score.
    *   Shows the "Steelman Argument" written by the other AI in favor of this plan.
2.  **Plan B Column (Right):**
    *   Displays the key details of Plan B.
    *   Includes a summary of the plan's rationale and confidence score.
    *   Shows the "Steelman Argument" written by the other AI in favor of this plan.
3.  **Center Column (Decision Hub):**
    *   **AI Recommendation:** Clearly displays the AI's final recommendation (`CHOOSE_A`, `CHOOSE_B`, or `SYNTHESIZE`) with a confidence score.
    *   **Conflict Summary:** A high-level summary of the key conflicts identified in the `AgreementAnalysis`.
    *   **User Actions:** A clear set of buttons for the user's final decision.

## 3. User Interaction Flow

1.  The user is presented with the three-column layout.
2.  The AI's recommended action is highlighted (e.g., the "Choose A" button is visually emphasized).
3.  The user can review the plans, the steelman arguments, and the conflict summary.
4.  The user clicks one of the three action buttons:
    *   **"Accept Plan A"**
    *   **"Accept Plan B"**
    *   **"Synthesize Best of Both"**
5.  A confirmation dialog appears.
6.  Upon confirmation, the UI sends the chosen action to the backend.

## 4. API Seam (User Action)

When the user makes a decision, the frontend will make a single API call:

*   **`POST /collaboration/resolve`**
    *   **Request Body:**
        ```json
        {
          "sessionId": "string",
          "chosenPath": "'A' | 'B' | 'SYNTHESIS'"
        }
        ```
    *   **Response Body:**
        ```json
        {
          "success": true,
          "finalPlan": "ProposedPlan | SynthesizedPlan"
        }
        ```

## 5. Real-time Updates (WebSocket)

*   The UI will show a loading indicator while the backend processes the user's choice (especially for synthesis).
*   The backend will send `progress_update` events over the WebSocket to keep the user informed.
*   Once the final plan is ready, the backend will send a `resolution_complete` event with the final plan as the payload.