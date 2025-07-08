/**
 * Tool: sdd_generate_contracts
 * 
 * Converts seam definitions into TypeScript interfaces with ContractResult<T> patterns.
 * Creates the technical contracts that ensure components can communicate reliably.
 */

import { SDDProject, GeneratedContract } from '../types/sdd.js';
import { aiClient } from '../utils/ai-client.js';
import { GENERATE_CONTRACTS_PROMPT, CONTRACT_TEMPLATES } from '../prompts/generate-contracts.js';

export async function generateContractsTool(args: any) {
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

    if (!sddProject.seams || sddProject.seams.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Project has no seams defined. Run sdd_analyze_requirements first.',
          },
        ],
      };
    }

    const contracts: GeneratedContract[] = [];

    // Generate contracts for each seam
    for (const seam of sddProject.seams) {
      const contract = await generateContractForSeam(seam, sddProject);
      if (contract) {
        contracts.push(contract);
      }
    }

    // Generate a main index file that exports all contracts
    const indexContent = generateIndexFile(contracts);
    contracts.push({
      seamId: 'index',
      fileName: 'contracts/index.ts',
      content: indexContent,
      interfaces: contracts.flatMap(c => c.interfaces),
    });

    // Update project with contracts
    sddProject.contracts = contracts;

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

async function generateContractForSeam(seam: any, project: SDDProject): Promise<GeneratedContract | null> {
  try {
    // Build context for the AI
    const domainContext = project.domain ? CONTRACT_TEMPLATES.domainTypes[project.domain as keyof typeof CONTRACT_TEMPLATES.domainTypes] || '' : '';
    
    const prompt = `${GENERATE_CONTRACTS_PROMPT}

SEAM DEFINITION:
${JSON.stringify(seam, null, 2)}

DOMAIN CONTEXT:
${domainContext}

Generate the complete TypeScript contract file for this seam:`;

    const result = await aiClient.complete({
      prompt,
      temperature: 0.3, // Lower temperature for more consistent code generation
      maxTokens: 2000,
    });

    if (!result.success) {
      console.error(`Failed to generate contract for seam ${seam.id}: ${result.error}`);
      return null;
    }

    // For development, create a mock contract
    const contractContent = generateMockContract(seam, project);
    
    // Extract interface names from the content
    const interfaces = extractInterfaceNames(contractContent);

    return {
      seamId: seam.id,
      fileName: `contracts/${seam.id}.ts`,
      content: contractContent,
      interfaces,
    };
  } catch (error) {
    console.error(`Error generating contract for seam ${seam.id}:`, error);
    return null;
  }
}

function generateMockContract(seam: any, project: SDDProject): string {
  const timestamp = new Date().toISOString();
  const seamNamePascal = toPascalCase(seam.name);
  const seamNameConstant = toConstantCase(seam.name);

  let content = CONTRACT_TEMPLATES.base
    .replace('{seamName}', seam.name)
    .replace('{timestamp}', timestamp);

  // Add domain types if applicable
  if (project.domain && CONTRACT_TEMPLATES.domainTypes[project.domain as keyof typeof CONTRACT_TEMPLATES.domainTypes]) {
    content += CONTRACT_TEMPLATES.domainTypes[project.domain as keyof typeof CONTRACT_TEMPLATES.domainTypes];
  }

  // Add error enum
  content += CONTRACT_TEMPLATES.errorEnum
    .replace(/{SeamName}/g, seamNamePascal)
    .replace(/{SEAM_NAME}/g, seamNameConstant);

  // Generate input interface
  content += `export interface ${seamNamePascal}Input {\n`;
  if (seam.dataFlow?.input?.fields) {
    seam.dataFlow.input.fields.forEach((field: any) => {
      if (field.description) {
        content += `  /** ${field.description} */\n`;
      }
      content += `  ${field.name}${field.required ? '' : '?'}: ${field.type};\n`;
    });
  }
  content += `}\n\n`;

  // Generate output interface
  content += `export interface ${seamNamePascal}Output {\n`;
  if (seam.dataFlow?.output?.fields) {
    seam.dataFlow.output.fields.forEach((field: any) => {
      if (field.description) {
        content += `  /** ${field.description} */\n`;
      }
      content += `  ${field.name}${field.required ? '' : '?'}: ${field.type};\n`;
    });
  }
  content += `}\n\n`;

  // Generate contract interface
  const methodName = toCamelCase(seam.name.replace(/\s+/g, ''));
  content += `export interface ${seamNamePascal}Contract {\n`;
  content += `  /**\n`;
  content += `   * ${seam.description || seam.purpose}\n`;
  content += `   * @param input - ${seam.dataFlow?.input?.name || 'Input data'}\n`;
  content += `   * @returns ContractResult with ${seam.dataFlow?.output?.name || 'output data'}\n`;
  content += `   */\n`;
  content += `  ${methodName}(input: ${seamNamePascal}Input): Promise<ContractResult<${seamNamePascal}Output>>;\n`;
  content += `}\n`;

  return content;
}

function generateIndexFile(contracts: GeneratedContract[]): string {
  let content = `/**
 * SDD Contract Index
 * Exports all contract definitions
 */

export { ContractResult } from '../types/sdd';

`;

  contracts.forEach(contract => {
    if (contract.seamId !== 'index') {
      const fileName = contract.fileName.replace('contracts/', '').replace('.ts', '');
      content += `export * from './${fileName}';\n`;
    }
  });

  return content;
}

function extractInterfaceNames(content: string): string[] {
  const interfaceRegex = /export\s+interface\s+(\w+)/g;
  const interfaces: string[] = [];
  let match;

  while ((match = interfaceRegex.exec(content)) !== null) {
    interfaces.push(match[1]);
  }

  return interfaces;
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