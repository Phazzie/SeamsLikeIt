# SeamsLikeIt Quick Reference for Gemini

## Essential Files to Read (in order)

### 1. Core Documentation
- `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/README.md` - Project overview
- `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/CLAUDE.md` - Seam-Driven Development principles
- `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/GEMINI_INTEGRATION.md` - Your integration guide

### 2. Implementation Files
- `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/src/index.ts` - Main server entry (tool definitions)
- `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/src/tools/orchestrate-parallel.ts` - See parallel execution
- `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/src/types/sdd.ts` - Core TypeScript types

### 3. Example Files
- `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/examples/ecommerce-project.md` - E-commerce example
- `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/test-remote-secure.html` - Working test UI

### 4. Current State Files
- `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/CHANGELOG.md` - Recent changes
- `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/LESSONS_LEARNED.md` - Insights from development

## Key Concepts Summary

### What is Seam-Driven Development?
- Define component communication BEFORE implementation
- All cross-component calls use ContractResult<T> pattern
- When broken, regenerate don't debug
- Integration failures become architecturally impossible

### The Tools (in workflow order)
1. `seam_analyze_requirements` → Components & Seams
2. `seam_generate_contracts` → TypeScript interfaces  
3. `seam_create_stubs` → Implementation blueprints
4. `seam_validate_integration` → Test connections
5. `seam_orchestrate_parallel` → Run all with 30-40% speedup

### The ContractResult Pattern
```typescript
interface ContractResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}
```

## Current Status
- ✅ Fully rebranded to SeamsLikeIt
- ✅ All tools working with OpenAI (gpt-4.1-mini-2025-04-1)
- ✅ Build completed (dist/ folder ready)
- ✅ Documentation consolidated
- ⚠️ UI 60% complete (buttons wired, WebSocket pending)
- ❌ Gemini provider not yet implemented

## Quick Test
```bash
# From mcp-server directory
node dist/index.js
# Should output: "SeamsLikeIt MCP Server running on stdio"
```

## Environment Variables Needed
```
OPENAI_API_KEY=your-key-here
AI_MODEL=gpt-4.1-mini-2025-04-1
```