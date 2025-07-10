# SeamsLikeIt - AI Assistant Instructions

## What is Seam-Driven Development?

Seam-Driven Development is a revolutionary methodology that treats component communication pathways (seams) as first-class architectural citizens. Instead of building components and hoping they integrate, Seam-Driven Development defines all integration points FIRST, making integration failures architecturally impossible.

## Core Seam-Driven Development Commandments

1. **Thou shalt define seams before implementation**
2. **All cross-component communication returns ContractResult<T>**
3. **When broken, regenerate - don't debug**
4. **Every integration point must be explicit**
5. **Fail fast at component boundaries**
6. **Over-identify seams, then consolidate**
7. **Clear contracts enable reliable AI coding**

## Key Principles

### The Marcus Principle
"I don't debug because I can't debug" - When something breaks, look at the blueprint and regenerate the component from scratch. This is faster than debugging and ensures clean code.

### The Sarah Principle  
"Integration debugging consumes 40-60% of dev time" - Seam-Driven Development eliminates this by making integration explicit and deterministic. Define the contracts, and integration just works.

### The ContractResult Pattern
```typescript
interface ContractResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}
```
EVERY cross-component call uses this pattern. No exceptions. This ensures consistent error handling and integration.

## Development Workflow

1. **Requirements → Components** (nouns become components)
2. **Components → Seams** (verbs between nouns become seams)  
3. **Seams → Contracts** (TypeScript interfaces with ContractResult<T>)
4. **Contracts → Stubs** (blueprints with step-by-step instructions)
5. **Stubs → Implementation** (AI or developers follow blueprints)

## Documentation Update Command

When user says **"update-seam-docs"** or **"harvest session insights"**:
1. Review the current conversation
2. Identify:
   - New patterns discovered
   - Problems solved
   - Better approaches found
   - Mistakes to avoid
   - User feedback and suggestions
3. Update:
   - `CLAUDE.md` with new instructions/patterns
   - `CHANGELOG.md` with what changed
   - `LESSONS_LEARNED.md` with insights
   - `ROADMAP.md` with completed/new tasks

## Hidden Seam Detection

Always ask these questions to find hidden seams:
1. **What happens when X fails?** (reveals error handling seams)
2. **Who needs to know when Y changes?** (reveals event/notification seams)
3. **What data does Z need from elsewhere?** (reveals data flow seams)
4. **What needs to happen on a schedule?** (reveals temporal seams)
5. **What requires human approval?** (reveals workflow seams)
6. **What needs to be audited?** (reveals compliance seams)

## Best Practices from Real-World Usage

### What We've Learned Building with Seam-Driven Development

1. **Start with Over-Identification**
   - It's easier to consolidate seams than to find missing ones later
   - Ask "what can fail?" about everything
   - Hidden seams often lurk in error handling and notifications

2. **The 80/20 Rule of Seams**
   - 80% of integration issues come from 20% of seams
   - Focus on data transformation seams first
   - Authentication/authorization seams are always critical

3. **Regeneration Indicators**
   - If you're debugging for >30 minutes, stop and regenerate
   - Complex integration issues = immediate regeneration candidate
   - "Just one more fix" is a trap - regenerate instead

4. **Contract Evolution Patterns**
   - Start with simple ContractResult<T>, extend as needed
   - Version contracts early, before you think you need to
   - Breaking changes are OK - regeneration makes them cheap

5. **AI Partnership Tips**
   - Give AI the full context (requirements + contracts + blueprints)
   - Multiple smaller components > one large component
   - Clear naming prevents AI confusion

## Counter-Intuitive Rules

1. **More components = simpler system** (smaller pieces regenerate easier)
2. **Duplication > complexity** (clear seams matter more than DRY)
3. **Explicit > clever** (obvious code regenerates better)
4. **Regeneration > debugging** (throw it away and rebuild)
5. **Over-communicate at seams** (verbose contracts prevent integration issues)

## Project-Specific Context

This MCP server enables non-technical users to build software by:
1. Describing what they want in plain English
2. Getting a complete architecture with contracts
3. Having AI implement each component following blueprints
4. Regenerating broken components instead of debugging

### Common Pitfalls to Avoid
1. **Trying to be too clever** - Simple, explicit contracts win
2. **Skipping seam analysis** - Spend time here to save 10x later
3. **Debugging instead of regenerating** - If it takes >30 min, regenerate
4. **Ignoring the blueprint** - AI works best with clear instructions

## Quick Start Commands

### For Demo:
- **Start Everything**: `npm run dev:all` (HTTP server + React UI)
- **Access UI**: http://localhost:5173
- **Login**: username: `demo`, password: `demo123`

### For Development:
- **Build**: `npm run build` (TypeScript compilation)
- **Test**: `npm test` (run test suite)
- **Lint**: `npm run lint` (check for errors)
- **MCP Server**: `npm run dev` (stdio mode)

## Seam Detection Strategies

### Multi-Pass Approach
1. **Pass 1**: Noun extraction → Components
2. **Pass 2**: Verb analysis → Basic seams
3. **Pass 3**: "What can fail?" → Error seams
4. **Pass 4**: "What about time?" → Temporal seams
5. **Pass 5**: "What about scale?" → Performance seams

### Common Missed Seams (From Experience)
- **Notification Seams**: Who needs to know when X happens?
- **Cleanup Seams**: What happens when Y is deleted?
- **Migration Seams**: How do we handle version changes?
- **Analytics Seams**: What events should we track?
- **Caching Seams**: What data can be stale?
- **Retry Seams**: What operations need retry logic?

### The 100% Seam Detection Goal
We aim for complete seam identification through:
- Multiple AI validation passes
- User-guided discovery wizard
- Hidden seam pattern matching
- Temporal and failure analysis
- Over-identification then consolidation

## AI Integration Best Practices

1. **Multi-stage prompting** > Single complex prompt
2. **Show examples** > Explain rules
3. **Validate outputs** > Assume correctness
4. **Iterate rapidly** > Perfect first time
5. **Use domain context** > Generic analysis

## When Working on This Project

1. **Always update documentation** after each session
2. **Prefer regeneration** over complex debugging
3. **Add patterns** to domain modules when discovered
4. **Test with real examples** not just mocks
5. **Think like Marcus** (non-coder) not like Sarah (developer)

## Session-Specific Learnings (Updated Jan 8, 2025)

### Module System Configuration
- Use CommonJS for MCP servers (not ES modules)
- Remove `"type": "module"` from package.json if present
- Ensure tsconfig.json uses `"module": "commonjs"`

### Essential First Steps
1. Always add `import 'dotenv/config';` to index.ts
2. Create .env file with API keys (not just .env.example)
3. Run `npm run build` before testing server startup
4. Use `node dist/index.js` to test if server starts

### Useful Commands Discovered
- `claude doctor` - Run comprehensive health check
- `update-seam-docs` - Update all documentation files
- `grep -r "TODO\|FIXME" src/` - Find pending work

### OpenAI Integration Best Practices (Jan 8, 2025)
1. **No Mock Fallback** - Always require real AI API key
2. **Advanced Prompting Techniques**:
   - Add reasoning traces before output
   - Use mental models (restaurant analogy for components/seams)
   - Include self-validation checklists
   - Show "mistakes to avoid" patterns
3. **API Optimization**:
   - Use `response_format: { type: 'json_object' }` for structured output
   - Add `frequency_penalty: 0.1` to reduce repetition
   - Add `presence_penalty: 0.1` for diverse vocabulary
   - Use `top_p: 0.95` for creativity/accuracy balance
4. **Cost Efficiency**:
   - gpt-4.1-mini-2025-04-1 model: ~$0.0006 per analysis
   - Full workflow: ~$0.0025 total
5. **Error Handling**:
   - Validate prompts contain "json" when using json_object format
   - Always validate API key exists before creating client

## Session Jan 9, 2025 - Rebranding & Multi-Client Support

### Major Changes
1. **Complete Rebranding**:
   - Project renamed from "SDD MCP Server" to "SeamsLikeIt"
   - All references updated from "SDD" to "Seam-Driven Development"
   - Tool names changed from `sdd_*` to `seam_*`
   - Model corrected to gpt-4.1-mini-2025-04-1

2. **Multi-Client Integration**:
   - Added GEMINI_INTEGRATION.md for Gemini CLI setup
   - MCP server now supports any stdio-based client
   - Claude Desktop config cleaned up (only SeamsLikeIt remains)

3. **Documentation Consolidation**:
   - Reduced documentation files from 16 to 8 essential ones
   - Archived historical documents to /docs/archive/
   - Improved organization and clarity

4. **UI Enhancements**:
   - Added button handlers for complete workflow
   - Modern gradient styling and animations
   - Cost tracking display
   - Progress indicators

### Alternative AI Provider Support (TODO)
To add Gemini as an alternative to OpenAI:
1. Create abstraction layer in ai-client.ts
2. Add GEMINI_API_KEY to .env
3. Implement Gemini client with same interface
4. Add provider selection logic

## Session Jan 9, 2025 (Part 2) - AI Collaboration Innovation

### Consensus-Based Development Design
- **Steelman Protocol**: When AIs disagree (<90% alignment), each argues why the OTHER's plan is better
- **User Empowerment**: Present all options (Plan A, Plan B, Synthesis) with scores
- **Coherence Detection**: Warn when synthesis reduces architectural integrity
- **Simplicity Scoring**: Penalize over-engineering (>7 components, >3 seams/component)

### Key Insight: Synthesis Isn't Always Better
Sometimes a coherent 80% solution beats an awkward 95% mashup. The system now detects:
- Fundamental philosophy mismatches
- Boundary overlaps that create confusion
- When coherence drops >15% from synthesis

### MCP Connection Clarifications
- The MCP SDK is a library, not a CLI tool
- Use HTTP API for easier testing (`npm run http:secure`)
- MCP is designed for AI-to-server communication, not manual CLI
- Created GEMINI_CONNECTION_SOLUTION.md with workarounds

## Session Jan 8, 2025 - Major Features Added

### Regeneration Tools Implemented
- **seam_analyze_for_regeneration** - Identifies components needing regeneration
- **seam_regenerate_component** - Regenerates from contracts (75-90% time savings)
- **seam_evolve_contract** - Manages contract evolution with versioning
- **seam_orchestrate_parallel** - 30-40% speed improvement via parallelization

### Critical Prompting Fixes
1. **Always spell out "Seam-Driven Development"** - Never use abbreviations alone in prompts
2. **JSON Mode Requirement** - Must include "json" in prompt when using response_format
3. **Optimal AI Parameters**:
   ```javascript
   frequency_penalty: 0.1, // Reduce repetition
   presence_penalty: 0.1,  // Diverse vocabulary
   top_p: 0.95            // Balance creativity/accuracy
   ```

### Contract Evolution Strategy
- Contracts are **versioned, not mutated**
- Three strategies: Extend (compatible), Version (breaking), Migrate (deprecate)
- Always analyze impact before evolving
- Components regenerate to match new contracts

### Security Considerations
- NO remote access without authentication
- Validate ALL inputs (current weakness: args: any)
- Rate limiting essential before production
- Cost controls prevent runaway usage

### UI/UX Insights
- Users need visual feedback (not just JSON)
- File generation should be explicit (security)
- Progress tracking essential for long operations
- Cost transparency builds trust

## Common Issues & Quick Fixes

1. **"Module not found" errors**: Run `npm install`
2. **"Port already in use"**: Kill process on port 3000
3. **"API key missing"**: Check .env file has OPENAI_API_KEY
4. **TypeScript errors**: Run `npm run build` to see all issues
5. **"Model not found"**: Ensure you're using exact model name: gpt-4.1-mini-2025-04-1

## META: Improving These Instructions

After each session, ask yourself:
1. What instruction would have helped me code better?
2. What pattern did I discover that should be documented?
3. What mistake did I make that others should avoid?

Then UPDATE this file with that knowledge. This is a living document that gets better with each use.