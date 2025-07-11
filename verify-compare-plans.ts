/**
 * Standalone script for verifying the comparePlansTool.
 */
import 'dotenv/config';
import { comparePlansTool } from './src/tools/collaboration/compare-plans.js';
import { ProposedPlan } from './src/types/collaboration.js';

const planA: ProposedPlan = {
  aiId: 'AI-Alpha',
  projectName: 'E-commerce Platform',
  tasks: [
    { id: 't1', name: 'User Authentication', description: 'Implement user login and registration.', dependencies: [], parallelizable: true },
    { id: 't2', name: 'Product Catalog', description: 'Build the product catalog service.', dependencies: [], parallelizable: true },
  ],
  architecture: [
    {
      component: { id: 'c1', name: 'Auth Service', purpose: 'Handles all user authentication.', responsibilities: ['Login', 'Registration'] },
      proposedSeams: ['s1'],
      rationale: 'A dedicated service for security.',
    },
  ],
  seams: [],
  rationale: 'A microservices approach.',
  confidenceScore: 90,
  timestamp: new Date(),
};

const planB: ProposedPlan = {
  aiId: 'AI-Beta',
  projectName: 'E-commerce Platform',
  tasks: [
    { id: 't1', name: 'User Login', description: 'Implement user login.', dependencies: [], parallelizable: true },
    { id: 't2', name: 'Product Service', description: 'Build the product catalog service.', dependencies: [], parallelizable: true },
    { id: 't3', name: 'Shopping Cart', description: 'Implement the shopping cart.', dependencies: ['t1', 't2'], parallelizable: false },
  ],
  architecture: [
    {
      component: { id: 'c1', name: 'User Service', purpose: 'Handles all user-related functionality.', responsibilities: ['Login', 'Registration', 'Profile'] },
      proposedSeams: ['s1', 's2'],
      rationale: 'A monolithic user service.',
    },
  ],
  seams: [],
  rationale: 'A more monolithic approach.',
  confidenceScore: 85,
  timestamp: new Date(),
};

async function main() {
  console.log('--- Running comparePlansTool in isolation ---');

  const result = await comparePlansTool({ planA, planB });

  console.log('--- Tool Result ---');
  console.log(result.content[0].text);
  console.log('-------------------');
}

main();
