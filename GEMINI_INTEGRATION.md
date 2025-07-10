# SeamsLikeIt MCP Server - Gemini CLI Integration Guide

## Quick Start (TL;DR)
1. Set your OpenAI API key: `set OPENAI_API_KEY=your-key-here`
2. Add the server config to your MCP client (see Step 4 below)
3. Start using tools like `seam_analyze_requirements`
4. The MCP client starts the server automatically - no manual startup needed!

## Overview
SeamsLikeIt is an MCP (Model Context Protocol) server that implements Seam-Driven Development methodology. This guide explains how to connect to SeamsLikeIt from Gemini CLI or other MCP-compatible clients.

## MCP Server Setup Instructions

### Step 1: Ensure Prerequisites
- Node.js 18+ installed (`node --version` to check)
- OpenAI API key ready
- SeamsLikeIt server files at: `C:\Users\thump\TextymcVoiceface\mcp-server\`

### Step 2: Set Environment Variable
```bash
# Windows Command Prompt
set OPENAI_API_KEY=your-openai-api-key-here

# Windows PowerShell
$env:OPENAI_API_KEY="your-openai-api-key-here"

# Unix/Mac/WSL
export OPENAI_API_KEY="your-openai-api-key-here"
```

### Step 3: Test the Server (Optional)
```bash
cd C:\Users\thump\TextymcVoiceface\mcp-server
node dist\index.js
```
You should see: `SeamsLikeIt MCP Server running on stdio`
Press Ctrl+C to stop. This just verifies the server works.

### Step 4: Configure Your MCP Client

**Important**: You do NOT need to start the server manually. The MCP client (Gemini CLI) will automatically start and manage the server when you use it.

#### For Gemini CLI
Add the following to your MCP configuration file:

```json
{
  "mcpServers": {
    "SeamsLikeIt": {
      "command": "node",
      "args": ["C:\\Users\\thump\\TextymcVoiceface\\mcp-server\\dist\\index.js"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here"
      }
    }
  }
}
```

### For Unix/Mac/WSL Systems
```json
{
  "mcpServers": {
    "SeamsLikeIt": {
      "command": "node",
      "args": ["/mnt/c/Users/thump/TextymcVoiceface/mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here"
      }
    }
  }
}
```

## Available Tools

### Core Workflow Tools
1. **`seam_analyze_requirements`** - Transform plain English requirements into components and seams
   - Input: `requirements` (string), `domain` (optional: healthcare/ecommerce/fintech)
   - Output: Project structure with components and seams

2. **`seam_generate_contracts`** - Create TypeScript interfaces from seam definitions
   - Input: `project` (object from analyze_requirements)
   - Output: TypeScript contracts with ContractResult<T> pattern

3. **`seam_create_stubs`** - Generate implementation blueprints
   - Input: `project` (object with contracts)
   - Output: Implementation files with detailed instructions

4. **`seam_validate_integration`** - Test component communication
   - Input: `project` (complete project object)
   - Output: Validation results and integration tests

### Orchestration Tools
5. **`seam_orchestrate_simple`** - Run complete workflow sequentially
   - Input: `requirements`, `domain` (optional), `outputPath` (optional)
   - Output: Complete project ready for implementation

6. **`seam_orchestrate_parallel`** - Run workflow with 30-40% speed improvement
   - Input: Same as orchestrate_simple
   - Output: Complete project using parallel processing

### Advanced Tools
7. **`seam_analyze_for_regeneration`** - Identify components needing regeneration
   - Input: `project`, `issues` (array), `codeSmells` (array)
   - Output: Regeneration recommendations

8. **`seam_regenerate_component`** - Regenerate component from contracts
   - Input: `project`, `componentId`, `reason`, `improvements`
   - Output: Fresh component implementation

9. **`seam_evolve_contract`** - Manage contract evolution
   - Input: `project`, `contractId`, `proposedChanges`, `strategy`
   - Output: Evolved contract with migration guide

## Example Usage

### Basic Workflow
```
1. Analyze requirements:
   Use seam_analyze_requirements with:
   - requirements: "Build an online bookstore with user reviews"
   - domain: "ecommerce"

2. Generate contracts:
   Use seam_generate_contracts with the project from step 1

3. Create implementation stubs:
   Use seam_create_stubs with the project from step 2

4. Validate integration:
   Use seam_validate_integration with the complete project
```

### Quick One-Step Process
```
Use seam_orchestrate_parallel with:
- requirements: "Your project description"
- domain: "healthcare" (optional)
```

## What is Seam-Driven Development?

Seam-Driven Development treats component communication pathways (seams) as first-class architectural citizens. Instead of building components and hoping they integrate, it defines all integration points FIRST, making integration failures architecturally impossible.

### Key Principles:
1. **Define seams before implementation**
2. **All cross-component communication returns ContractResult<T>**
3. **When broken, regenerate - don't debug**
4. **Clear contracts enable reliable AI coding**

### The ContractResult Pattern
```typescript
interface ContractResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}
```

## Requirements
- Node.js 18 or higher
- OpenAI API key (uses gpt-4.1-mini-2025-04-1 model)
- 8GB RAM recommended for parallel processing

## Cost Information
Using OpenAI's gpt-4.1-mini-2025-04-1 model:
- Analyze Requirements: ~$0.0006
- Generate Contracts: ~$0.0005
- Create Stubs: ~$0.0008
- Full Workflow: ~$0.0025

## Troubleshooting

### Server won't start
- Ensure Node.js 18+ is installed: `node --version`
- Check if dist/index.js exists
- Verify OPENAI_API_KEY is set

### Tools not responding
- Check API key is valid
- Ensure you're using correct tool names (seam_*, not sdd_*)
- Verify project object structure when chaining tools

### Performance issues
- Use `seam_orchestrate_parallel` for 30-40% speed improvement
- Process smaller requirement sets
- Check available system memory

## Support
- Repository: https://github.com/Phazzie/SeamsLikeIt
- Issues: https://github.com/Phazzie/SeamsLikeIt/issues

## Version
SeamsLikeIt v1.0.0 - Built with Seam-Driven Development principles