# Contract Evolution Guide - The Missing Piece of SDD Refactoring

## The Contract Paradox

Contracts are supposed to be **immutable** (unchangeable), but business requirements **do** change. How do we resolve this?

## The SDD Contract Evolution Strategy

### 1. **Contracts are Versioned, Not Mutated**

```typescript
// DON'T: Modify existing contract
interface UserService {
  getUser(id: string): User; // was returning BasicUser
}

// DO: Version the contract
interface UserServiceV1 {
  getUser(id: string): BasicUser;
}

interface UserServiceV2 {
  getUser(id: string): DetailedUser; // new version
}
```

### 2. **The Three Evolution Strategies**

#### Strategy 1: **Extend** (Backward Compatible)
Add optional fields without breaking existing consumers:
```typescript
// Original
interface CreateUserInput {
  name: string;
  email: string;
}

// Extended (backward compatible)
interface CreateUserInput {
  name: string;
  email: string;
  phoneNumber?: string; // new optional field
}
```

#### Strategy 2: **Version** (Breaking Changes)
Create new version when changes would break consumers:
```typescript
// V1 Contract
interface PaymentContractV1 {
  processPayment(amount: number): PaymentResult;
}

// V2 Contract (breaking change - new required parameter)
interface PaymentContractV2 {
  processPayment(amount: number, currency: string): PaymentResult;
}
```

#### Strategy 3: **Deprecate & Migrate** (Phased Transition)
Gradually move consumers to new contract:
```typescript
interface UserService {
  /** @deprecated Use getUserV2 instead. Will be removed in v3.0 */
  getUser(id: string): BasicUser;
  
  getUserV2(id: string): DetailedUser;
}
```

## The Complete Contract Evolution Flow

### Step 1: Analyze Impact
```typescript
Use sdd_evolve_contract with:
- project: <your project>
- contractId: "user-service-contract"
- proposedChanges: [
    "Add user preferences to response",
    "Include last login timestamp"
  ]
- breakingChangeStrategy: "version" // or "migrate" or "extend"
```

### Step 2: Review Evolution Plan
The tool will analyze:
- Is this backward compatible?
- Which components are affected?
- What's the migration timeline?
- What tests are needed?

### Step 3: Regenerate Affected Components
After contract evolution, regenerate components:
```typescript
// For each affected component
Use sdd_regenerate_component with:
- project: <updated project>
- componentId: "user-service"
- reason: "Contract evolved to v2"
- improvements: ["Implement new contract version"]
```

## Real-World Example: Adding Multi-Currency Support

### Initial State
```typescript
// Original Contract
interface PaymentContract {
  processPayment(amount: number): Promise<ContractResult<Payment>>;
}
```

### Business Requirement
"We're going international - need multi-currency support!"

### Step 1: Evolve the Contract
```typescript
Use sdd_evolve_contract with:
- contractId: "payment-contract"
- proposedChanges: [
    "Add currency parameter to processPayment",
    "Support currency conversion",
    "Return amount in both original and converted currency"
  ]
- breakingChangeStrategy: "version"
```

### Step 2: Tool Generates Evolution Plan
```json
{
  "strategy": "version",
  "analysis": {
    "isBackwardCompatible": false,
    "breakingChanges": ["New required parameter 'currency'"],
    "riskLevel": "medium"
  },
  "newContract": {
    "id": "payment-contract-v2",
    "version": 2,
    "interface": "processPayment(amount: number, currency: string, targetCurrency?: string)"
  },
  "migrationPlan": {
    "steps": [
      "1. Deploy v2 contract alongside v1",
      "2. Update payment service to support both versions",
      "3. Migrate consumers one by one",
      "4. Deprecate v1 after all migrated",
      "5. Remove v1 in next major release"
    ],
    "timeline": "phased"
  }
}
```

### Step 3: Regenerate Components
```typescript
// Regenerate payment service to support both contract versions
Use sdd_regenerate_component with:
- componentId: "payment-service"
- reason: "Support both v1 and v2 payment contracts"
- improvements: [
    "Implement version routing",
    "Add currency conversion logic",
    "Maintain backward compatibility"
  ]
```

## Contract Evolution Best Practices

### 1. **Document Everything**
```typescript
interface PaymentContractV2 {
  /**
   * Process payment with currency support
   * @param amount - Payment amount
   * @param currency - ISO 4217 currency code (USD, EUR, etc.)
   * @since v2.0
   * @breaking-change Added required currency parameter
   */
  processPayment(amount: number, currency: string): Promise<ContractResult<Payment>>;
}
```

### 2. **Use Feature Flags**
```typescript
if (featureFlags.usePaymentV2) {
  return paymentServiceV2.processPayment(amount, currency);
} else {
  return paymentServiceV1.processPayment(amount);
}
```

### 3. **Provide Migration Tools**
```typescript
// Adapter to help consumers migrate
class PaymentV1ToV2Adapter implements PaymentContractV2 {
  constructor(private v1Service: PaymentContractV1) {}
  
  async processPayment(amount: number, currency: string) {
    // Adapter assumes USD for v1 calls
    if (currency !== 'USD') {
      amount = await convertCurrency(amount, currency, 'USD');
    }
    return this.v1Service.processPayment(amount);
  }
}
```

## The Contract Evolution Decision Tree

```
Need to change a contract?
│
├─ Is it backward compatible?
│  │
│  ├─ YES → Use "extend" strategy
│  │
│  └─ NO → Breaking change needed?
│     │
│     ├─ Critical/Security → Use "migrate" strategy (fast transition)
│     │
│     └─ Feature/Enhancement → Use "version" strategy (slow transition)
```

## Common Contract Evolution Patterns

### 1. **The Expander** (Adding Optional Fields)
```typescript
// Safe to extend
interface Before {
  name: string;
}

interface After {
  name: string;
  description?: string; // optional = safe
}
```

### 2. **The Enricher** (Enhanced Response)
```typescript
// Safe if additional data doesn't break parsers
interface Before {
  user: { id: string; name: string; }
}

interface After {
  user: { id: string; name: string; email: string; }
  metadata?: { timestamp: string; } // extra info
}
```

### 3. **The Transformer** (Complete Redesign)
```typescript
// Requires versioning
interface V1 {
  getData(): string[];
}

interface V2 {
  getData(): { items: string[]; pagination: {...} };
}
```

## Testing Contract Evolution

### 1. **Compatibility Tests**
```typescript
test('V1 consumers still work with evolved service', async () => {
  const v1Consumer = new OldConsumer();
  const evolvedService = new ServiceWithBothVersions();
  
  // Should work without modification
  const result = await v1Consumer.useService(evolvedService);
  expect(result).toBeDefined();
});
```

### 2. **Migration Tests**
```typescript
test('Can migrate from V1 to V2', async () => {
  const v1Data = await serviceV1.getData();
  const v2Data = await migrateToV2(v1Data);
  
  expect(v2Data).toMatchSchema(V2Schema);
});
```

## Summary

Contract evolution in SDD follows these principles:

1. **Contracts are versioned, not mutated**
2. **Backward compatibility is paramount**
3. **Breaking changes require migration plans**
4. **Components regenerate to match new contracts**
5. **Evolution is deliberate and documented**

Remember: Contracts are promises. When promises must change, we create new promises alongside the old ones, giving everyone time to adjust.

The combination of:
- `sdd_evolve_contract` (evolve the promise)
- `sdd_regenerate_component` (regenerate the implementation)
- `sdd_orchestrate_parallel` (fast execution)

Gives us a complete refactoring toolkit that honors SDD principles while adapting to change.