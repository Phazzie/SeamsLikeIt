// Quick test for collaboration tools
const { proposePlan } = require('./dist/tools/collaboration/propose-plan.js');
const { comparePlans } = require('./dist/tools/collaboration/compare-plans.js');

async function testCollaboration() {
  console.log('Testing collaboration tools...\n');
  
  // Test data
  const mockPlanA = {
    aiId: 'Claude',
    projectName: 'Online Bookstore',
    tasks: [
      { id: 't1', name: 'Setup User Service', description: 'Create user authentication', parallelizable: true },
      { id: 't2', name: 'Create Book Catalog', description: 'Implement book management', parallelizable: true }
    ],
    architecture: [
      {
        component: {
          id: 'user-service',
          name: 'UserService',
          purpose: 'Handle user authentication and profiles',
          responsibilities: ['Authentication', 'Profile management']
        },
        proposedSeams: ['auth-seam'],
        rationale: 'Centralized user management'
      }
    ],
    seams: [
      {
        id: 'auth-seam',
        name: 'Authentication',
        description: 'User login/logout',
        participants: {
          producer: { id: 'user-service', name: 'UserService', purpose: 'Auth provider', responsibilities: [] },
          consumer: { id: 'frontend', name: 'Frontend', purpose: 'UI', responsibilities: [] }
        },
        dataFlow: {
          input: { name: 'LoginRequest', fields: [{ name: 'username', type: 'string', required: true }] },
          output: { name: 'LoginResponse', fields: [{ name: 'token', type: 'string', required: true }] }
        },
        purpose: 'Secure user authentication'
      }
    ],
    rationale: 'Simple microservices approach',
    confidenceScore: 85
  };
  
  const mockPlanB = {
    aiId: 'Gemini',
    projectName: 'Online Bookstore System',
    tasks: [
      { id: 't1', name: 'Build Monolith Core', description: 'Create integrated system', parallelizable: false },
      { id: 't2', name: 'Add Review Module', description: 'User reviews feature', parallelizable: false }
    ],
    architecture: [
      {
        component: {
          id: 'core-system',
          name: 'BookstoreCore',
          purpose: 'Integrated bookstore functionality',
          responsibilities: ['Users', 'Books', 'Orders', 'Reviews']
        },
        proposedSeams: ['api-gateway'],
        rationale: 'Simpler deployment'
      }
    ],
    seams: [
      {
        id: 'api-gateway',
        name: 'API Gateway',
        description: 'Single entry point',
        participants: {
          producer: { id: 'core-system', name: 'BookstoreCore', purpose: 'Main system', responsibilities: [] },
          consumer: { id: 'clients', name: 'Clients', purpose: 'Various clients', responsibilities: [] }
        },
        dataFlow: {
          input: { name: 'APIRequest', fields: [{ name: 'endpoint', type: 'string', required: true }] },
          output: { name: 'APIResponse', fields: [{ name: 'data', type: 'any', required: true }] }
        },
        purpose: 'Unified API access'
      }
    ],
    rationale: 'Monolithic approach for simplicity',
    confidenceScore: 80
  };
  
  // Test compare plans
  try {
    const comparisonResult = await comparePlans({
      planA: mockPlanA,
      planB: mockPlanB
    });
    
    console.log('Plan Comparison Result:');
    console.log(JSON.parse(comparisonResult.content[0].text));
  } catch (error) {
    console.error('Error testing compare plans:', error);
  }
}

testCollaboration().catch(console.error);