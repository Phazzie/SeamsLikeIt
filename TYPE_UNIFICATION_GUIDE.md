# Type Unification Guide

This guide helps align collaboration types with core SDD types.

## Core Types (from sdd.ts) - DO NOT CHANGE THESE

```typescript
// Component Definition
export interface ComponentDefinition {
  id: string;
  name: string;
  purpose: string;  // Note: not "description" or "type"
  responsibilities: string[];
  dependencies?: string[];
  domainContext?: string;
}

// Seam Definition  
export interface SeamDefinition {
  id: string;
  name: string;
  description: string;
  participants: {
    producer: ComponentDefinition;  // Full object, not just ID
    consumer: ComponentDefinition;  // Full object, not just ID
  };
  dataFlow: {
    input: InterfaceDefinition;
    output: InterfaceDefinition;
  };
  purpose: string;
  businessRules?: string[];
  errorScenarios?: ErrorScenario[];
}

// Interface Definition
export interface InterfaceDefinition {
  name: string;
  fields: FieldDefinition[];
  validation?: ValidationRule[];
}

// Field Definition
export interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  constraints?: string[];
}

// Validation Rule
export interface ValidationRule {
  field: string;
  rule: string;
  errorMessage: string;  // Required!
}

// Error Scenario
export interface ErrorScenario {
  condition: string;    // When this error occurs
  errorType: string;    // Type/category of error
  handling: string;     // How to handle it
  userMessage?: string; // Optional user-facing message
}
```

## Collaboration-Specific Types (KEEP THESE)

```typescript
// Task - collaboration specific, no equivalent in sdd.ts
export interface Task {
  id: string;
  name: string;
  description: string;
  dependencies?: string[];
  estimatedMinutes?: number;
  parallelizable: boolean;
  componentId?: string;
}

// ProposedPlan - collaboration specific
export interface ProposedPlan {
  aiId: string;
  projectName: string;
  tasks: Task[];
  architecture: ComponentDesign[];  // Uses ComponentDefinition inside
  seams: SeamDefinition[];         // Uses core SeamDefinition
  rationale: string;
  confidenceScore: number;
  timestamp: Date;
}

// ComponentDesign - wraps ComponentDefinition
export interface ComponentDesign {
  component: ComponentDefinition;   // Uses core type
  proposedSeams: string[];         // Just IDs of seams
  rationale: string;
}
```

## Migration Examples

### Old collaboration SeamDefinition:
```typescript
{
  id: "user-auth-seam",
  name: "User Authentication",
  producerId: "user-component",    // Just ID
  consumerId: "auth-component",    // Just ID
  dataFlow: { ... },
  purpose: "Authenticate users"
}
```

### New unified SeamDefinition:
```typescript
{
  id: "user-auth-seam",
  name: "User Authentication", 
  description: "Handles user authentication flow",
  participants: {
    producer: {  // Full ComponentDefinition
      id: "user-component",
      name: "User Service",
      purpose: "Manages user data and operations",
      responsibilities: ["User CRUD", "Profile management"],
      dependencies: []
    },
    consumer: {  // Full ComponentDefinition
      id: "auth-component",
      name: "Auth Service",
      purpose: "Handles authentication and authorization",
      responsibilities: ["Login", "Token generation"],
      dependencies: ["user-component"]
    }
  },
  dataFlow: { ... },
  purpose: "Authenticate users",
  businessRules: ["Passwords must be hashed"],
  errorScenarios: [{
    condition: "Invalid credentials provided",
    errorType: "AUTH_FAILED",
    handling: "Return 401 with error message",
    userMessage: "Invalid username or password"
  }]
}
```

## Tools Update Pattern

When updating tools that expect IDs instead of full objects:

```typescript
// Old way (expecting IDs)
const producerId = seam.producerId;
const consumerId = seam.consumerId;

// New way (extracting from participants)
const producerId = seam.participants.producer.id;
const consumerId = seam.participants.consumer.id;
```

## Zod Schema Alignment

The Zod schemas in `contracts/collaboration.ts` need to match these exact structures. No shortcuts with `z.any()` - define the full nested structure.