/**
 * Tool: sdd_create_stubs
 * 
 * Generates complete implementation files with comprehensive headers and detailed blueprints.
 * Each stub includes step-by-step implementation guidance that AI or developers can follow.
 */

import { SDDProject, GeneratedStub, BlueprintSection } from '../types/sdd.js';
import { aiClient } from '../utils/ai-client.js';
import { CREATE_STUBS_PROMPT, STUB_TEMPLATES } from '../prompts/create-stubs.js';

export async function createStubsTool(args: any) {
  try {
    const { project } = args;

    if (!project || typeof project !== 'object') {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Project object is required',
          },
        ],
      };
    }

    const sddProject = project as SDDProject;

    if (!sddProject.contracts || sddProject.contracts.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Project has no contracts defined. Run sdd_generate_contracts first.',
          },
        ],
      };
    }

    const stubs: GeneratedStub[] = [];

    // Generate stubs for each component
    for (const component of sddProject.components) {
      const stub = await generateStubForComponent(component, sddProject);
      if (stub) {
        stubs.push(stub);
      }
    }

    // Update project with stubs
    sddProject.stubs = stubs;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(sddProject, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

async function generateStubForComponent(component: any, project: SDDProject): Promise<GeneratedStub | null> {
  try {
    // Find seams where this component is involved
    const producerSeams = project.seams.filter(s => s.participants.producer.id === component.id);
    const consumerSeams = project.seams.filter(s => s.participants.consumer.id === component.id);

    // Get relevant contracts
    const relevantContracts = project.contracts?.filter(c => 
      producerSeams.some(s => s.id === c.seamId) || 
      consumerSeams.some(s => s.id === c.seamId)
    ) || [];

    const prompt = `${CREATE_STUBS_PROMPT}

COMPONENT:
${JSON.stringify(component, null, 2)}

PRODUCER SEAMS (this component provides these):
${JSON.stringify(producerSeams, null, 2)}

CONSUMER SEAMS (this component uses these):
${JSON.stringify(consumerSeams, null, 2)}

CONTRACTS:
${relevantContracts.map(c => c.content).join('\n\n')}

Generate the complete stub implementation file for this component:`;

    const result = await aiClient.complete({
      prompt,
      temperature: 0.3,
      maxTokens: 3000,
    });

    if (!result.success) {
      console.error(`Failed to generate stub for component ${component.id}: ${result.error}`);
      return null;
    }

    // For development, create a mock stub
    const stubContent = generateMockStub(component, producerSeams, consumerSeams, project);
    const blueprintSections = extractBlueprintSections(producerSeams);

    return {
      componentId: component.id,
      fileName: `components/${component.id}.ts`,
      content: stubContent,
      blueprintSections,
    };
  } catch (error) {
    console.error(`Error generating stub for component ${component.id}:`, error);
    return null;
  }
}

function generateMockStub(component: any, producerSeams: any[], consumerSeams: any[], project: SDDProject): string {
  const componentNamePascal = toPascalCase(component.name);

  // Collect contract imports
  const contractImports = new Set<string>();
  [...producerSeams, ...consumerSeams].forEach(seam => {
    const seamName = toPascalCase(seam.name);
    contractImports.add(`${seamName}Input`);
    contractImports.add(`${seamName}Output`);
    contractImports.add(`${seamName}Contract`);
    contractImports.add(`${seamName}Errors`);
  });

  // Generate methods for producer seams
  const methods: string[] = [];
  producerSeams.forEach(seam => {
    const method = generateMethodStub(seam, component, project.domain);
    methods.push(method);
  });

  // Generate helper methods
  const helpers = generateHelperMethods(component, producerSeams);

  // Build the stub content
  let content = STUB_TEMPLATES.classComponent
    .replace(/{ComponentName}/g, componentNamePascal)
    .replace('{ContractImports}', Array.from(contractImports).join(', '))
    .replace('{ContractInterfaces}', producerSeams.map(s => `${toPascalCase(s.name)}Contract`).join(', '))
    .replace('{methods}', methods.join('\n\n  '))
    .replace('{helpers}', helpers);

  // Add file header
  const header = `/**
 * Component: ${component.name}
 * Purpose: ${component.purpose}
 * Status: STUB - Ready for implementation
 * 
 * Connections:
 * - Produces: ${producerSeams.map(s => s.name).join(', ') || 'None'}
 * - Consumes: ${consumerSeams.map(s => s.name).join(', ') || 'None'}
 * 
 * Change Blueprint:
 * To modify this component:
 * 1. Update the contract first in contracts/${component.id}.ts
 * 2. Regenerate this stub using sdd_create_stubs
 * 3. Re-implement following the new blueprint
 */

`;

  return header + content;
}

function generateMethodStub(seam: any, _component: any, domain?: string): string {
  const methodName = toCamelCase(seam.name.replace(/\s+/g, ''));
  const inputType = `${toPascalCase(seam.name)}Input`;
  const outputType = `${toPascalCase(seam.name)}Output`;
  const errorEnum = `${toPascalCase(seam.name)}Errors`;

  // Get blueprint steps based on method purpose
  const blueprintSteps = inferBlueprintSteps(seam, domain);

  let method = `async ${methodName}(input: ${inputType}): Promise<ContractResult<${outputType}>> {
    // BLUEPRINT: ${seam.purpose || seam.description}
    // `;

  // Add blueprint steps
  blueprintSteps.forEach((step, index) => {
    method += `
    // STEP ${index + 1}: ${step}`;
  });

  // Add error scenarios
  method += `
    //
    // ERROR SCENARIOS:`;

  if (seam.errorScenarios) {
    seam.errorScenarios.forEach((scenario: any) => {
      method += `
    // - ${scenario.condition}: Return { success: false, error: ${errorEnum}.${toConstantCase(scenario.errorType)} }`;
    });
  } else {
    method += `
    // - Validation fails: Return { success: false, error: ${errorEnum}.VALIDATION_FAILED }
    // - Resource not found: Return { success: false, error: ${errorEnum}.NOT_FOUND }
    // - Unauthorized access: Return { success: false, error: ${errorEnum}.UNAUTHORIZED }`;
  }

  method += `
    //
    // SUCCESS: Return { success: true, data: { /* ${outputType} */ } }
    
    throw new NotImplementedError(
      '${methodName} not implemented. Follow blueprint above.'
    );
  }`;

  return method;
}

function inferBlueprintSteps(seam: any, domain?: string): string[] {
  const steps: string[] = [];
  const seamNameLower = seam.name.toLowerCase();

  // Always start with validation
  steps.push('Validate input parameters and check required fields');

  // Infer steps based on seam name and purpose
  if (seamNameLower.includes('create') || seamNameLower.includes('add')) {
    steps.push(...STUB_TEMPLATES.blueprintSteps.crud.create);
  } else if (seamNameLower.includes('update') || seamNameLower.includes('modify')) {
    steps.push(...STUB_TEMPLATES.blueprintSteps.crud.update);
  } else if (seamNameLower.includes('delete') || seamNameLower.includes('remove')) {
    steps.push(...STUB_TEMPLATES.blueprintSteps.crud.delete);
  } else if (seamNameLower.includes('get') || seamNameLower.includes('fetch') || seamNameLower.includes('read')) {
    steps.push(...STUB_TEMPLATES.blueprintSteps.crud.read);
  } else if (seamNameLower.includes('approve') || seamNameLower.includes('reject')) {
    steps.push(...STUB_TEMPLATES.blueprintSteps.workflow.approval);
  } else if (seamNameLower.includes('process') || seamNameLower.includes('execute')) {
    steps.push(...STUB_TEMPLATES.blueprintSteps.workflow.processing);
  } else {
    // Generic steps
    steps.push(
      'Check user permissions if applicable',
      'Perform main business logic',
      'Handle any side effects or notifications',
      'Prepare and validate response data'
    );
  }

  // Add domain-specific steps
  if (domain === 'healthcare') {
    steps.push('Ensure HIPAA compliance and audit trail');
  } else if (domain === 'fintech') {
    steps.push('Record transaction for regulatory compliance');
  } else if (domain === 'ecommerce') {
    steps.push('Update relevant analytics and metrics');
  }

  return steps;
}

function generateHelperMethods(component: any, _seams: any[]): string {
  const helpers: string[] = [];

  // Add common validation helper
  helpers.push(`private validateInput<T>(input: T, rules: ValidationRule[]): ContractResult<void> {
    // BLUEPRINT: Common validation logic
    // - Check each rule against input
    // - Return first validation failure
    // - Return success if all rules pass
    throw new NotImplementedError('validateInput helper not implemented');
  }`);

  // Add data access helper if component seems to need it
  if (component.responsibilities.some((r: string) => r.toLowerCase().includes('data') || r.toLowerCase().includes('storage'))) {
    helpers.push(`private async fetchFromDataStore<T>(id: string): Promise<ContractResult<T>> {
    // BLUEPRINT: Data fetching with error handling
    // - Connect to data store
    // - Execute query with timeout
    // - Handle connection errors
    // - Transform and return data
    throw new NotImplementedError('fetchFromDataStore helper not implemented');
  }`);
  }

  return helpers.join('\n\n  ');
}

function extractBlueprintSections(seams: any[]): BlueprintSection[] {
  return seams.map(seam => ({
    method: toCamelCase(seam.name.replace(/\s+/g, '')),
    steps: inferBlueprintSteps(seam),
    errorHandling: seam.errorScenarios?.map((e: any) => e.handling) || ['Return appropriate error in ContractResult'],
    performanceNotes: seam.performanceRequirements,
    securityNotes: seam.securityRequirements,
  }));
}

function toPascalCase(str: string): string {
  return str
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toConstantCase(str: string): string {
  return str
    .split(/[\s-]+/)
    .join('_')
    .toUpperCase();
}