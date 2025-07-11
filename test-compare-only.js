// Test just the comparison logic without AI dependencies
const fs = require('fs');

// Mock the comparePlans logic directly
function calculateAgreement(planA, planB) {
  const conflicts = [];
  
  // Compare tasks
  const taskComparison = compareTasks(planA.tasks, planB.tasks);
  
  // Compare components  
  const componentComparison = compareComponents(
    planA.architecture.map(a => a.component),
    planB.architecture.map(a => a.component)
  );
  
  // Compare seams
  const seamComparison = compareSeams(planA.seams, planB.seams);
  
  // Calculate overall agreement
  const overallAgreement = (
    taskComparison.alignment * 0.3 +
    componentComparison.alignment * 0.35 +
    seamComparison.alignment * 0.35
  );
  
  return {
    overallAgreement: Math.round(overallAgreement),
    agreedTasks: taskComparison.agreed,
    disagreedTasks: taskComparison.disagreed,
    architecturalAlignment: componentComparison.alignment,
    seamAlignment: seamComparison.alignment,
    componentAlignment: componentComparison.alignment,
    conflicts
  };
}

function compareTasks(tasksA, tasksB) {
  const agreed = [];
  const disagreed = [];
  const alignment = 50; // Simplified for test
  return { agreed, disagreed, alignment };
}

function compareComponents(componentsA, componentsB) {
  return { alignment: 30 }; // Very different architectures
}

function compareSeams(seamsA, seamsB) {
  return { alignment: 40 }; // Some overlap
}

// Test data
const mockPlanA = {
  aiId: 'Claude',
  tasks: [
    { id: 't1', name: 'Setup User Service', description: 'Create user authentication' },
    { id: 't2', name: 'Create Book Catalog', description: 'Implement book management' }
  ],
  architecture: [
    {
      component: {
        id: 'user-service',
        name: 'UserService',
        purpose: 'Handle user authentication',
        responsibilities: ['Authentication', 'Profile management']
      }
    }
  ],
  seams: [
    {
      id: 'auth-seam',
      name: 'Authentication',
      purpose: 'Secure user authentication'
    }
  ]
};

const mockPlanB = {
  aiId: 'Gemini',
  tasks: [
    { id: 't1', name: 'Build Monolith Core', description: 'Create integrated system' }
  ],
  architecture: [
    {
      component: {
        id: 'core-system',
        name: 'BookstoreCore',
        purpose: 'Integrated bookstore functionality',
        responsibilities: ['Users', 'Books', 'Orders', 'Reviews']
      }
    }
  ],
  seams: [
    {
      id: 'api-gateway',
      name: 'API Gateway',
      purpose: 'Unified API access'
    }
  ]
};

// Test
const result = calculateAgreement(mockPlanA, mockPlanB);
console.log('Comparison Result:', JSON.stringify(result, null, 2));
console.log('\nExpected agreement: ~40% (significant architectural differences)');