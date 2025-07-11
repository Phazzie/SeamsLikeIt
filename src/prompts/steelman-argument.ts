/**
 * Prompt for AI to generate a steelman argument for another AI's plan
 */

export function getSteelmanPrompt(targetPlan: any, arguingAiId: string, focusAreas?: string[]): string {
  const focusContext = focusAreas && focusAreas.length > 0 
    ? `\n\nFOCUS AREAS: Please pay special attention to these areas of disagreement:\n${focusAreas.map(area => `- ${area}`).join('\n')}`
    : '';
  
  return `You are ${arguingAiId}, an AI assistant analyzing another AI's proposed plan.

IMPORTANT: Your task is to argue why the OTHER AI's plan is BETTER than any alternative.
This is a steelman argument - you must present the strongest possible case for their approach.

TARGET PLAN TO ADVOCATE FOR:
${JSON.stringify(targetPlan, null, 2)}

${focusContext}

YOUR STEELMAN ARGUMENT SHOULD:

1. STRENGTHS: Identify at least 3-5 major strengths of their approach
   - Technical advantages
   - Design elegance
   - Practical benefits
   - Future-proofing aspects

2. EDGE CASES HANDLED: What edge cases or corner cases does their plan handle well?
   - Error scenarios they anticipated
   - Scalability considerations
   - Security aspects
   - User experience edge cases

3. ARCHITECTURAL BENEFITS: Why is their architecture superior?
   - Clean separation of concerns
   - Clear boundaries
   - Extensibility
   - Maintainability
   - Performance advantages

4. WEAKNESSES ADDRESSED: What potential weaknesses in alternative approaches does this plan avoid?
   - Common pitfalls avoided
   - Complexity reduction
   - Integration challenges solved
   - Technical debt minimized

5. OVERALL ASSESSMENT: A compelling summary of why this plan should be chosen

6. STRENGTH SCORE: Rate how strong this plan is overall (0-100)

REMEMBER:
- You are arguing FOR this plan, not against it
- Find genuine strengths, not superficial ones
- Consider why a neutral observer would choose this approach
- Think about long-term benefits, not just immediate implementation
- Acknowledge clever design decisions and insights

OUTPUT FORMAT: Return a JSON object with this structure:
{
  "strengths": [
    "Their separation of Review service creates cleaner boundaries",
    "The notification seam handles async updates elegantly",
    "Their task ordering prevents circular dependencies"
  ],
  "edgeCasesHandled": [
    "Handles concurrent review submissions gracefully",
    "Addresses the case where a product is deleted while being reviewed",
    "Considers network failures in payment processing"
  ],
  "architecturalBenefits": [
    "Microservices approach allows independent scaling",
    "Clear event-driven architecture for notifications",
    "Stateless design improves reliability"
  ],
  "weaknessesAddressed": [
    "Avoids the monolithic user service bottleneck",
    "Prevents tight coupling between reviews and products",
    "Eliminates single point of failure in authentication"
  ],
  "overallAssessment": "This plan demonstrates superior architectural thinking by...",
  "strengthScore": 85
}

Remember to use "json" in your response for proper formatting.`;
}