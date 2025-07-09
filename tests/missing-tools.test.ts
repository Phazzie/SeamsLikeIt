import { describe, it, expect, jest } from '@jest/globals';
import { createStubsTool } from '../src/tools/create-stubs';
import { validateIntegrationTool } from '../src/tools/validate-integration';

// Mock the AI client
jest.mock('../src/utils/ai-client', () => ({
  aiClient: {
    complete: jest.fn().mockResolvedValue({
      success: true,
      data: {
        content: JSON.stringify({
          stubs: [
            {
              componentName: 'UserService',
              fileName: 'user-service.ts',
              imports: ['import { UserContract } from "./contracts";'],
              classDefinition: 'export class UserService implements UserContract',
              methods: ['async createUser() {}', 'async getUser() {}']
            }
          ]
        })
      }
    })
  }
}));

describe('Missing Tool Tests', () => {
  describe('createStubsTool', () => {
    it('should generate stubs from contracts', async () => {
      const mockArgs = {
        contracts: [
          {
            name: 'UserContract',
            version: '1.0.0',
            methods: [
              { name: 'createUser', input: 'UserData', output: 'User' },
              { name: 'getUser', input: 'string', output: 'User' }
            ]
          }
        ],
        components: [
          {
            name: 'UserService',
            contracts: ['UserContract']
          }
        ]
      };
      
      const result = await createStubsTool(mockArgs);
      
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      
      const stubs = JSON.parse(result.content[0].text);
      expect(stubs.stubs).toHaveLength(1);
      expect(stubs.stubs[0].componentName).toBe('UserService');
    });
    
    it('should handle missing contracts gracefully', async () => {
      const mockArgs = {
        contracts: [],
        components: []
      };
      
      const result = await createStubsTool(mockArgs);
      
      expect(result.content[0].text).toContain('Error');
    });
  });
  
  describe('validateIntegrationTool', () => {
    it('should validate component integration', async () => {
      const mockProjectData = {
        components: [
          { id: 'user-service', name: 'UserService' },
          { id: 'auth-service', name: 'AuthService' }
        ],
        seams: [
          {
            id: 'auth-user-seam',
            participants: {
              producer: 'auth-service',
              consumer: 'user-service'
            },
            dataFlow: {
              input: { token: 'string' },
              output: { userId: 'string' }
            }
          }
        ]
      };
      
      const result = await validateIntegrationTool({ projectData: mockProjectData });
      
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      
      const validation = JSON.parse(result.content[0].text);
      expect(validation).toHaveProperty('validationResults');
    });
    
    it('should detect integration issues', async () => {
      const mockProjectData = {
        components: [{ id: 'orphan', name: 'OrphanService' }],
        seams: []
      };
      
      const result = await validateIntegrationTool({ projectData: mockProjectData });
      const validation = JSON.parse(result.content[0].text);
      
      expect(validation.validationResults).toBeDefined();
      // Should detect orphan component with no seams
    });
  });
  
  describe('Tool Error Handling', () => {
    it('should handle AI client failures gracefully', async () => {
      const { aiClient } = require('../src/utils/ai-client');
      aiClient.complete.mockRejectedValueOnce(new Error('AI service unavailable'));
      
      const result = await createStubsTool({
        contracts: [{ name: 'Test', version: '1.0.0', methods: [] }],
        components: []
      });
      
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('AI service unavailable');
    });
  });
});