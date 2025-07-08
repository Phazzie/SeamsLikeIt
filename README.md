# SDD MCP Server

An MCP (Model Context Protocol) server that implements Software-Defined Development (SDD) methodology, enabling domain experts to build enterprise-quality applications through AI-assisted development.

## What is SDD?

Software-Defined Development treats component communication pathways (seams) as first-class architectural citizens. By defining clear contracts before implementation, SDD eliminates integration issues and enables reliable AI-assisted development.

### Key Principles

1. **Seams First, Implementation Second** - Define how components communicate before building them
2. **ContractResult Pattern** - All cross-component calls return standardized results
3. **Fail-Fast Validation** - Catch errors at component boundaries
4. **Blueprint-Driven Development** - Detailed implementation guidance in every stub

## Installation

```bash
npm install -g sdd-mcp-server
```

Or install locally:

```bash
git clone https://github.com/yourusername/sdd-mcp-server.git
cd sdd-mcp-server
npm install
npm run build
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "sdd": {
      "command": "sdd-mcp-server"
    }
  }
}
```

### Available Tools

#### 1. `sdd_analyze_requirements`
Transform plain English requirements into SDD-compliant component and seam definitions.

```typescript
// Example usage in Claude:
Use sdd_analyze_requirements with:
- requirements: "Build an online bookstore with inventory management"
- domain: "ecommerce"
```

#### 2. `sdd_generate_contracts`
Convert seam definitions into TypeScript interfaces with ContractResult patterns.

```typescript
// Takes the project output from analyze_requirements
Use sdd_generate_contracts with the project object
```

#### 3. `sdd_create_stubs`
Generate implementation files with detailed blueprints for AI or developers to follow.

```typescript
// Takes the project with contracts
Use sdd_create_stubs with the project object
```

#### 4. `sdd_validate_integration`
Test that components can communicate properly through their defined seams.

```typescript
// Validates the complete project
Use sdd_validate_integration with the project object
```

#### 5. `sdd_orchestrate_simple`
Run the complete SDD workflow from requirements to ready-to-implement project.

```typescript
// One-step project generation
Use sdd_orchestrate_simple with:
- requirements: "Your project description"
- domain: "healthcare|ecommerce|fintech" (optional)
- outputPath: "/path/to/save/project" (optional)
```

## Domain-Specific Intelligence

The server includes specialized patterns for:

### Healthcare
- HIPAA compliance patterns
- Patient data security
- Clinical workflow templates
- Audit trail requirements

### E-commerce
- Payment processing patterns
- Inventory management
- Shopping cart workflows
- PCI compliance

### Fintech
- Financial precision (bigint for money)
- Transaction patterns
- KYC/AML compliance
- Regulatory reporting

## Example Workflow

### 1. Start with Requirements
```
I need a patient appointment scheduling system that integrates with our EHR
```

### 2. Analyze Requirements
The tool identifies:
- Components: Patient Service, Appointment Service, EHR Integration
- Seams: Book Appointment, Check Availability, Update Medical Record

### 3. Generate Contracts
Creates TypeScript interfaces:
```typescript
export interface BookAppointmentInput {
  patientId: PatientId;
  providerId: ProviderId;
  requestedTime: Date;
  visitType: 'routine' | 'urgent' | 'followup';
}

export interface BookAppointmentContract {
  bookAppointment(input: BookAppointmentInput): Promise<ContractResult<Appointment>>;
}
```

### 4. Create Stubs
Generates implementation blueprints:
```typescript
async bookAppointment(input: BookAppointmentInput): Promise<ContractResult<Appointment>> {
  // BLUEPRINT: Book patient appointment with provider
  // 
  // STEP 1: Validate patient and provider exist
  // STEP 2: Check provider availability at requested time
  // STEP 3: Verify patient insurance coverage
  // STEP 4: Create appointment record
  // STEP 5: Send confirmation to patient
  // STEP 6: Update provider calendar
  //
  // ERROR SCENARIOS:
  // - Provider not available: Return SCHEDULING_CONFLICT
  // - Insurance not verified: Return INSURANCE_PENDING
  
  throw new NotImplementedError('Follow blueprint above');
}
```

### 5. Implement with AI
Give the stub to AI: "Implement this following the blueprint exactly"

## Development

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

### Running locally
```bash
npm run dev
```

## Architecture

```
src/
├── index.ts           # MCP server setup
├── tools/             # Tool implementations
│   ├── analyze-requirements.ts
│   ├── generate-contracts.ts
│   ├── create-stubs.ts
│   ├── validate-integration.ts
│   └── orchestrate-simple.ts
├── types/             # TypeScript type definitions
├── prompts/           # AI prompting templates
├── domain-modules/    # Domain-specific patterns
└── utils/             # Shared utilities
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

ISC License - see LICENSE file for details