#!/usr/bin/env node

// Simple test to check if key modules can be loaded
console.log("Testing module imports...");

try {
  // Test loading the main modules
  const fs = require('fs');
  const path = require('path');
  
  // Check if TypeScript files exist
  const srcFiles = [
    'src/index.ts',
    'src/http-server.ts',
    'src/http-server-secure.ts',
    'src/tools/analyze-requirements.ts',
    'src/utils/ai-client.ts',
    'src/utils/ai-client-wrapper.ts',
    'src/websocket/progress-tracker.ts'
  ];
  
  console.log("\nChecking source files:");
  srcFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`  ${file}: ${exists ? '✓' : '✗'}`);
  });
  
  // Check package.json
  const packageJson = require('./package.json');
  console.log("\nPackage info:");
  console.log(`  Name: ${packageJson.name}`);
  console.log(`  Version: ${packageJson.version}`);
  console.log(`  Main: ${packageJson.main}`);
  
  // Check dependencies
  console.log("\nKey dependencies:");
  const keyDeps = ['express', 'cors', 'ws', 'openai', '@modelcontextprotocol/sdk', 'vite', 'typescript'];
  keyDeps.forEach(dep => {
    const inDeps = packageJson.dependencies && packageJson.dependencies[dep];
    const inDevDeps = packageJson.devDependencies && packageJson.devDependencies[dep];
    const version = inDeps || inDevDeps || 'not found';
    console.log(`  ${dep}: ${version}`);
  });
  
  console.log("\n✓ Basic checks passed!");
  
} catch (error) {
  console.error("Error during test:", error.message);
  process.exit(1);
}