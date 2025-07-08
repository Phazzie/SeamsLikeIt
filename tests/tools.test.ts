/**
 * Integration tests for SDD MCP Server tools
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { analyzeRequirementsTool } from '../src/tools/analyze-requirements';
import { generateContractsTool } from '../src/tools/generate-contracts';
import { createStubsTool } from '../src/tools/create-stubs';
import { validateIntegrationTool } from '../src/tools/validate-integration';
import { orchestrateSimpleTool } from '../src/tools/orchestrate-simple';

describe('SDD MCP Server Tools', () => {
  describe('analyzeRequirementsTool', () => {
    it('should analyze simple requirements', async () => {
      const result = await analyzeRequirementsTool({
        requirements: 'Build a simple todo list application with user authentication',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      
      const project = JSON.parse(result.content[0].text);
      expect(project.name).toBeDefined();
      expect(project.components).toBeInstanceOf(Array);
      expect(project.seams).toBeInstanceOf(Array);
    });

    it('should apply domain-specific patterns', async () => {
      const result = await analyzeRequirementsTool({
        requirements: 'Build a patient appointment scheduling system',
        domain: 'healthcare',
      });

      expect(result.content).toBeDefined();
      const project = JSON.parse(result.content[0].text);
      expect(project.domain).toBe('healthcare');
    });

    it('should handle missing requirements', async () => {
      const result = await analyzeRequirementsTool({});
      
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('Requirements text is required');
    });
  });

  describe('generateContractsTool', () => {
    let sampleProject: any;

    beforeEach(() => {
      sampleProject = {
        name: 'Test Project',
        description: 'A test project',
        components: [
          {
            id: 'user-service',
            name: 'User Service',
            purpose: 'Manages users',
            responsibilities: ['User management'],
          },
        ],
        seams: [
          {
            id: 'create-user',
            name: 'Create User',
            description: 'Creates a new user',
            participants: {
              producer: { id: 'user-service', name: 'User Service' },
              consumer: { id: 'api-gateway', name: 'API Gateway' },
            },
            dataFlow: {
              input: {
                name: 'CreateUserInput',
                fields: [
                  { name: 'email', type: 'string', required: true },
                  { name: 'name', type: 'string', required: true },
                ],
              },
              output: {
                name: 'CreateUserOutput',
                fields: [
                  { name: 'id', type: 'string', required: true },
                  { name: 'email', type: 'string', required: true },
                ],
              },
            },
            purpose: 'Create new user accounts',
          },
        ],
      };
    });

    it('should generate contracts from project', async () => {
      const result = await generateContractsTool({ project: sampleProject });

      expect(result.content).toBeDefined();
      const updatedProject = JSON.parse(result.content[0].text);
      expect(updatedProject.contracts).toBeInstanceOf(Array);
      expect(updatedProject.contracts.length).toBeGreaterThan(0);
    });

    it('should handle missing project', async () => {
      const result = await generateContractsTool({});
      
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('Project object is required');
    });

    it('should handle project with no seams', async () => {
      const projectWithoutSeams = { ...sampleProject, seams: [] };
      const result = await generateContractsTool({ project: projectWithoutSeams });
      
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('no seams defined');
    });
  });

  describe('orchestrateSimpleTool', () => {
    it('should orchestrate complete workflow', async () => {
      const result = await orchestrateSimpleTool({
        requirements: 'Build a simple calculator API',
      });

      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
      expect(response.project).toBeDefined();
      expect(response.summary).toBeDefined();
    });

    it('should handle domain-specific orchestration', async () => {
      const result = await orchestrateSimpleTool({
        requirements: 'Build an online shopping cart',
        domain: 'ecommerce',
      });

      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text);
      expect(response.project.domain).toBe('ecommerce');
    });
  });
});