/**
 * Test cases for the Structured Generation pattern
 * 
 * These tests ensure the structured approach handles various
 * complexity levels and edge cases properly.
 */

import { structuredGenerationTool } from '../src/tools/collaboration/structured-generation.js';

export const testCases = [
  {
    name: "Simple Todo App",
    input: {
      requirements: "Build a todo list app where users can create, edit, complete, and delete tasks",
      aiId: "TestAI",
      domain: "general"
    },
    expected: {
      minComponents: 2,
      maxComponents: 4,
      expectedComponents: ["User", "Task", "TaskManager"],
      minSeams: 2,
      maxSeams: 5,
      expectedSeams: ["user-creates-task", "task-status-update"]
    }
  },
  
  {
    name: "Complex E-commerce Platform",
    input: {
      requirements: "Build an e-commerce platform with user accounts, product catalog, shopping cart, payment processing, order tracking, inventory management, and email notifications",
      aiId: "TestAI", 
      domain: "ecommerce"
    },
    expected: {
      minComponents: 7,
      maxComponents: 10,
      expectedComponents: ["User", "Product", "Cart", "Order", "Payment", "Inventory", "NotificationService"],
      minSeams: 10,
      maxSeams: 15,
      criticalSeams: ["payment-processing", "inventory-update", "order-creation"]
    }
  },
  
  {
    name: "Single Component Edge Case",
    input: {
      requirements: "Build a simple calculator that performs basic math operations",
      aiId: "TestAI",
      domain: "general"
    },
    expected: {
      minComponents: 1,
      maxComponents: 2,
      expectedComponents: ["Calculator"],
      minSeams: 0,
      maxSeams: 1
    }
  },
  
  {
    name: "Healthcare Domain Test",
    input: {
      requirements: "Build a patient appointment scheduling system with doctor availability, appointment reminders, and medical record access",
      aiId: "TestAI",
      domain: "healthcare"
    },
    expected: {
      minComponents: 4,
      maxComponents: 6,
      expectedComponents: ["Patient", "Doctor", "Appointment", "MedicalRecord"],
      criticalSeams: ["appointment-scheduling", "record-access-authorization"],
      domainSpecific: true
    }
  },
  
  {
    name: "Empty Requirements",
    input: {
      requirements: "",
      aiId: "TestAI",
      domain: "general"
    },
    expected: {
      shouldFail: true,
      errorType: "validation"
    }
  },
  
  {
    name: "Circular Dependency Detection",
    input: {
      requirements: "Build a system where Service A depends on Service B, Service B depends on Service C, and Service C depends on Service A",
      aiId: "TestAI",
      domain: "general"
    },
    expected: {
      shouldDetectCircular: true,
      components: ["ServiceA", "ServiceB", "ServiceC"]
    }
  },
  
  {
    name: "Performance Stress Test",
    input: {
      requirements: "Build a comprehensive enterprise resource planning (ERP) system with modules for accounting, human resources, inventory management, customer relationship management, supply chain management, project management, business intelligence, compliance tracking, document management, and real-time reporting dashboards",
      aiId: "TestAI",
      domain: "fintech"
    },
    expected: {
      minComponents: 10,
      maxComponents: 15,
      shouldCompleteWithin: 5000, // milliseconds
      shouldHandleComplexity: true
    }
  }
];

// Validation function to check if generated plan meets expectations
export function validatePlan(plan: any, testCase: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const expected = testCase.expected;
  
  // Check component count
  if (plan.architecture) {
    const componentCount = plan.architecture.length;
    if (expected.minComponents && componentCount < expected.minComponents) {
      errors.push(`Too few components: ${componentCount} < ${expected.minComponents}`);
    }
    if (expected.maxComponents && componentCount > expected.maxComponents) {
      errors.push(`Too many components: ${componentCount} > ${expected.maxComponents}`);
    }
    
    // Check for expected components
    if (expected.expectedComponents) {
      const componentNames = plan.architecture.map((c: any) => c.component?.name || c.name);
      for (const expectedComp of expected.expectedComponents) {
        if (!componentNames.some((name: string) => name.includes(expectedComp))) {
          errors.push(`Missing expected component: ${expectedComp}`);
        }
      }
    }
  }
  
  // Check seam count
  if (plan.seams) {
    const seamCount = plan.seams.length;
    if (expected.minSeams && seamCount < expected.minSeams) {
      errors.push(`Too few seams: ${seamCount} < ${expected.minSeams}`);
    }
    if (expected.maxSeams && seamCount > expected.maxSeams) {
      errors.push(`Too many seams: ${seamCount} > ${expected.maxSeams}`);
    }
    
    // Check for critical seams
    if (expected.criticalSeams) {
      const seamNames = plan.seams.map((s: any) => s.name);
      for (const criticalSeam of expected.criticalSeams) {
        if (!seamNames.some((name: string) => name.includes(criticalSeam))) {
          errors.push(`Missing critical seam: ${criticalSeam}`);
        }
      }
    }
  }
  
  // Check for circular dependencies
  if (expected.shouldDetectCircular && !plan.warnings?.includes('circular')) {
    errors.push('Failed to detect circular dependencies');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Performance test helper
export async function runPerformanceTest(testCase: any): Promise<{ 
  passed: boolean; 
  duration: number; 
  errors: string[] 
}> {
  const start = Date.now();
  
  try {
    const result = await structuredGenerationTool(testCase.input);
    const duration = Date.now() - start;
    
    if (testCase.expected.shouldCompleteWithin && duration > testCase.expected.shouldCompleteWithin) {
      return {
        passed: false,
        duration,
        errors: [`Performance test failed: ${duration}ms > ${testCase.expected.shouldCompleteWithin}ms`]
      };
    }
    
    // Parse and validate the result
    const plan = JSON.parse(result.content[0].text);
    const validation = validatePlan(plan, testCase);
    
    return {
      passed: validation.valid,
      duration,
      errors: validation.errors
    };
  } catch (error) {
    return {
      passed: false,
      duration: Date.now() - start,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}