/**
 * Tool: sdd_orchestrate_simple
 * 
 * Coordinates the entire SDD workflow from requirements to ready-to-implement project.
 * This is the main entry point for users who want to go from idea to implementation.
 */

import { SDDProject } from '../types/sdd.js';
import { analyzeRequirementsTool } from './analyze-requirements.js';
import { generateContractsTool } from './generate-contracts.js';
import { createStubsTool } from './create-stubs.js';
import { validateIntegrationTool } from './validate-integration.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function orchestrateSimpleTool(args: any) {
  try {
    const { requirements, domain, outputPath } = args;

    if (!requirements || typeof requirements !== 'string') {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Requirements text is required',
          },
        ],
      };
    }

    console.error('Starting SDD orchestration...');

    // Step 1: Analyze requirements
    console.error('Step 1/4: Analyzing requirements...');
    const analysisResult = await analyzeRequirementsTool({ requirements, domain });
    
    if (!analysisResult.content || analysisResult.content[0].type !== 'text') {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Failed to analyze requirements',
          },
        ],
      };
    }

    let project: SDDProject;
    try {
      project = JSON.parse(analysisResult.content[0].text);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Failed to parse analysis result: ${error}`,
          },
        ],
      };
    }

    // Step 2: Generate contracts
    console.error('Step 2/4: Generating contracts...');
    const contractsResult = await generateContractsTool({ project });
    
    if (!contractsResult.content || contractsResult.content[0].type !== 'text') {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Failed to generate contracts',
          },
        ],
      };
    }

    try {
      project = JSON.parse(contractsResult.content[0].text);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Failed to parse contracts result: ${error}`,
          },
        ],
      };
    }

    // Step 3: Create stubs
    console.error('Step 3/4: Creating implementation stubs...');
    const stubsResult = await createStubsTool({ project });
    
    if (!stubsResult.content || stubsResult.content[0].type !== 'text') {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Failed to create stubs',
          },
        ],
      };
    }

    try {
      project = JSON.parse(stubsResult.content[0].text);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Failed to parse stubs result: ${error}`,
          },
        ],
      };
    }

    // Step 4: Validate integration
    console.error('Step 4/4: Validating integration...');
    const validationResult = await validateIntegrationTool({ project });
    
    if (!validationResult.content || validationResult.content[0].type !== 'text') {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Failed to validate integration',
          },
        ],
      };
    }

    try {
      project = JSON.parse(validationResult.content[0].text);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Failed to parse validation result: ${error}`,
          },
        ],
      };
    }

    // If output path is provided, save the project files
    if (outputPath) {
      await saveProjectFiles(project, outputPath);
    }

    // Generate summary
    const summary = generateProjectSummary(project);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            project,
            summary,
            outputPath: outputPath || 'Not saved to disk',
          }, null, 2),
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

async function saveProjectFiles(project: SDDProject, outputPath: string) {
  try {
    // Create base directory
    await fs.mkdir(outputPath, { recursive: true });

    // Save project metadata
    await fs.writeFile(
      path.join(outputPath, 'sdd-project.json'),
      JSON.stringify(project, null, 2)
    );

    // Create directory structure
    await fs.mkdir(path.join(outputPath, 'contracts'), { recursive: true });
    await fs.mkdir(path.join(outputPath, 'components'), { recursive: true });
    await fs.mkdir(path.join(outputPath, 'tests'), { recursive: true });
    await fs.mkdir(path.join(outputPath, 'types'), { recursive: true });

    // Save contracts
    if (project.contracts) {
      for (const contract of project.contracts) {
        const filePath = path.join(outputPath, contract.fileName);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, contract.content);
      }
    }

    // Save stubs
    if (project.stubs) {
      for (const stub of project.stubs) {
        const filePath = path.join(outputPath, stub.fileName);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, stub.content);
      }
    }

    // Create base SDD types file
    await fs.writeFile(
      path.join(outputPath, 'types', 'sdd.ts'),
      `export interface ContractResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ValidationRule {
  field: string;
  rule: string;
  errorMessage: string;
}
`
    );

    // Create README
    await fs.writeFile(
      path.join(outputPath, 'README.md'),
      generateProjectReadme(project)
    );

    // Create package.json
    await fs.writeFile(
      path.join(outputPath, 'package.json'),
      JSON.stringify({
        name: project.name.toLowerCase().replace(/\s+/g, '-'),
        version: '0.1.0',
        description: project.description,
        type: 'module',
        scripts: {
          test: 'jest',
          'test:integration': 'jest tests/integration.test.ts',
          build: 'tsc',
          dev: 'tsx watch src/index.ts',
        },
        dependencies: {},
        devDependencies: {
          '@types/jest': '^29.0.0',
          '@types/node': '^20.0.0',
          jest: '^29.0.0',
          'ts-jest': '^29.0.0',
          tsx: '^4.0.0',
          typescript: '^5.0.0',
        },
      }, null, 2)
    );

    // Create tsconfig.json
    await fs.writeFile(
      path.join(outputPath, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'commonjs',
          lib: ['ES2022'],
          outDir: './dist',
          rootDir: './',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          moduleResolution: 'node',
        },
        include: ['**/*.ts'],
        exclude: ['node_modules', 'dist'],
      }, null, 2)
    );

  } catch (error) {
    console.error('Error saving project files:', error);
    throw error;
  }
}

function generateProjectSummary(project: SDDProject): string {
  let summary = `# ${project.name} - SDD Project Summary\n\n`;
  summary += `${project.description}\n\n`;
  
  summary += `## Architecture Overview\n`;
  summary += `- Components: ${project.components.length}\n`;
  summary += `- Seams: ${project.seams.length}\n`;
  summary += `- Domain: ${project.domain || 'General'}\n\n`;

  summary += `## Components\n`;
  project.components.forEach(comp => {
    summary += `### ${comp.name}\n`;
    summary += `- Purpose: ${comp.purpose}\n`;
    summary += `- Responsibilities:\n`;
    comp.responsibilities.forEach(resp => {
      summary += `  - ${resp}\n`;
    });
    summary += `\n`;
  });

  summary += `## Integration Points (Seams)\n`;
  project.seams.forEach(seam => {
    summary += `### ${seam.name}\n`;
    summary += `- Producer: ${seam.participants.producer.name}\n`;
    summary += `- Consumer: ${seam.participants.consumer.name}\n`;
    summary += `- Purpose: ${seam.purpose}\n`;
    summary += `\n`;
  });

  if (project.validationResults) {
    const validationSummary = (project as any).validationSummary;
    summary += `## Validation Results\n`;
    summary += validationSummary?.summary || 'No validation summary available';
    summary += `\n`;
  }

  summary += `## Next Steps\n`;
  summary += `1. Review generated contracts in \`contracts/\` directory\n`;
  summary += `2. Implement methods in \`components/\` following the blueprints\n`;
  summary += `3. Run integration tests to verify implementation\n`;
  summary += `4. Use AI to implement each component following the detailed blueprints\n`;

  return summary;
}

function generateProjectReadme(project: SDDProject): string {
  return `# ${project.name}

${project.description}

## Project Structure

This is an SDD (Software-Defined Development) project generated using the SDD MCP Server.

### Directory Structure
- \`contracts/\` - TypeScript interfaces defining component communication
- \`components/\` - Implementation stubs with detailed blueprints
- \`tests/\` - Integration tests for validating component interactions
- \`types/\` - Shared type definitions

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Review the contracts to understand component interactions

3. Implement components following the blueprints in each stub file

4. Run tests to verify implementation:
   \`\`\`bash
   npm test
   \`\`\`

## SDD Methodology

This project follows Software-Defined Development principles:
- **Seams First**: All component interactions are defined before implementation
- **ContractResult Pattern**: All cross-component calls return \`ContractResult<T>\`
- **Fail-Fast Validation**: Input validation at component boundaries
- **Blueprint-Driven**: Detailed implementation steps in every stub

## Components

${project.components.map(c => `- **${c.name}**: ${c.purpose}`).join('\n')}

## Development Workflow

1. Make contract changes first if interfaces need to change
2. Regenerate stubs after contract changes
3. Follow blueprints exactly for implementation
4. Run integration tests to verify changes

## AI Implementation

Each stub file contains detailed blueprints that can be given to AI for implementation:
1. Copy the stub file content
2. Ask AI to implement following the blueprint
3. AI will follow the step-by-step instructions
4. Test the implementation with integration tests
`;
}