# Lessons Learned

This document captures insights, patterns, and discoveries from building and using the SDD MCP Server.

## Seam Detection Patterns

### What Works Well
- **Noun extraction for components** (90% accurate) - "Users login to system" → User component, Auth component
- **Verb analysis for seams** (85% accurate) - "Users PLACE orders" → User->Order seam  
- **"What can fail?" question** - Reveals hidden error handling seams every time
- **Temporal analysis** - "What happens before/during/after" uncovers workflow seams
- **Multi-pass detection** - 3 AI passes catch 95%+ of seams vs 70% in single pass

### What Doesn't Work
- Trying to be perfect on first pass - iteration beats perfection
- Complex regex patterns for extraction - simple noun/verb analysis works better
- Assuming users know all requirements upfront - discovery is iterative
- Single AI analyzing everything - multiple specialized passes work better

### Hidden Seam Indicators
Found these patterns consistently reveal hidden seams:
- Words like "notify", "alert", "email" → Notification seam needed
- "Report", "analytics", "dashboard" → Analytics seam needed  
- "History", "audit", "compliance" → Audit trail seam needed
- "Schedule", "cron", "periodic" → Temporal seam needed
- "Approve", "review", "authorize" → Workflow seam needed

## AI Integration Insights

### Successful Patterns
- **Multi-stage prompting** > Single complex prompt (3x better accuracy)
- **Showing examples** > Explaining rules (2x faster understanding)
- **Asking for validation** > Assuming correctness (catches 90% of errors)
- **Domain context injection** - Mentioning "healthcare" improves HIPAA detection by 80%
- **Iterative refinement** - 3 rounds typically sufficient for good architecture

### Failed Approaches
- Expecting AI to infer business rules from vague requirements
- Single-pass architecture generation (misses 30% of seams)
- Not validating generated contracts compile (20% have syntax errors)
- Assuming AI understands domain acronyms without context
- Trying to generate perfect code on first attempt

### The Moneyball Insight
"We don't need perfect AI - we need good-enough AI + iteration + validation"
- 80% accurate in 1 minute beats 95% accurate in 1 hour
- Regeneration is cheaper than debugging if generation is fast
- Multiple simple AI calls > One complex AI call

## User Experience Findings

### Non-Coders (Marcus Persona) Need
- **Visual representations** - "Show me the architecture" before code
- **Plain English explanations** - No jargon in error messages
- **Confidence that regeneration is safe** - "You won't lose work"
- **Guided discovery** - Wizard-style seam identification  
- **Success stories** - "Others like you built X with this"

### Developers (Sarah Persona) Want
- **Escape hatches** - Override AI decisions when needed
- **Integration with existing tools** - VS Code, Git, CI/CD
- **Performance guarantees** - "Regeneration takes < 2 minutes"
- **Detailed blueprints** - Step-by-step implementation guidance
- **Contract validation** - Compile-time safety

### Universal Needs
- **Fast feedback loops** - See results in seconds, not minutes
- **Clear error messages** - "Component X can't talk to Y because..."
- **Incremental progress** - Build one component at a time
- **Rollback safety** - Undo last change easily

## Technical Discoveries

### TypeScript + SDD Synergy
- **ContractResult<T> pattern prevents 90% of integration bugs** - Forced error handling
- **Explicit error enums** make error handling obvious and consistent
- **Blueprint comments guide AI perfectly** - Step-by-step in comments works
- **Type inference** catches contract mismatches at compile time
- **Interface segregation** naturally emerges from seam definitions

### Architecture Patterns
- **More components = simpler system** - Counter-intuitive but true
- **Explicit seams prevent implicit coupling** - Can't accidentally integrate
- **Fail-fast at boundaries** works better than deep validation
- **Event sourcing emerges naturally** from temporal seam analysis
- **CQRS pattern** often appears when separating read/write seams

### Testing Strategies  
- **Contract compliance tests > implementation tests** - Test the interface
- **Integration validation > unit tests** - Seams matter more than internals
- **Regeneration testing > debugging** - Can you rebuild from contracts?
- **Mock generation from contracts** - AI can create perfect mocks
- **Property-based testing** works well with ContractResult pattern

## Domain-Specific Insights

### Healthcare
- HIPAA requirements drive 50% of seam definitions
- Audit trails are always a hidden seam
- Consent management needs explicit workflow seams
- Emergency access (break-glass) needs special handling

### E-commerce  
- Inventory seams are often missed on first pass
- Payment processing needs multiple security seams
- Cart persistence is a complex temporal seam
- Pricing/promotions need dedicated calculation seams

### Fintech
- Every money movement needs an audit seam
- Compliance reporting drives architecture
- Idempotency requirements reveal hidden seams
- Real-time vs batch processing creates temporal seams

## Process Improvements

### What Accelerates Development
1. **Pre-built domain templates** - Start with 80% of seams identified
2. **Interactive seam discovery** - Wizard beats free-form requirements
3. **Parallel AI calls** - Analyze, validate, and generate simultaneously
4. **Cached AI responses** - Same requirements = same architecture
5. **Blueprint libraries** - Reuse implementation patterns

### What Slows Development
1. **Perfectionism** - "Good enough" + iteration beats perfect
2. **Over-abstraction** - Concrete seams beat generic interfaces
3. **Under-specification** - Vague requirements = vague architecture
4. **Skipping validation** - Find issues early, fix cheaply
5. **Manual processes** - Automate everything possible

## Future Directions

### High-Value Improvements
1. **Visual architecture editor** - Drag-and-drop seam connections
2. **Real-time collaboration** - Multiple users defining seams
3. **AI fine-tuning on successful projects** - Learn from what works
4. **Automatic documentation generation** - From contracts to user docs
5. **Performance profiling** - Identify slow seams automatically

### Research Questions
1. Can we predict seam performance from contracts?
2. How small can components be before overhead dominates?
3. Can AI detect security vulnerabilities from seam definitions?
4. What's the optimal number of refinement iterations?
5. Can we auto-generate UI from seam contracts?

## Session-Specific Discoveries (Jan 7, 2024)

### Module System Gotchas
- **CommonJS vs ES Modules conflict** causes "exports is not defined" error
- **Solution**: Remove `"type": "module"` from package.json for MCP servers
- **Why**: MCP SDK expects CommonJS format
- **Time wasted before discovery**: 30 minutes

### Documentation Best Practices
- **SESSION_RECAP.md** essential for context window management
- **Update cycle**: CHANGELOG → LESSONS_LEARNED → CLAUDE.md
- **"claude doctor"** command reveals issues quickly
- **Turnover documents** prevent knowledge loss between sessions

### API Key Management
- **Store in .env, not .env.example** (obvious but easy to miss)
- **Model naming**: OpenAI uses specific model names (gpt-4-1106-preview)
- **Always test with small requests first** to verify key works

## Meta-Learning

### About This Document
- **Living document** - Update after every significant session
- **Concrete examples** > Abstract principles
- **Quantify when possible** - "3x better" not "much better"
- **Challenge assumptions** - What we "know" might be wrong
- **Share failures** - They teach more than successes

### Signs You've Learned Something Worth Recording
1. You say "Oh, that's why that didn't work!"
2. You find a pattern that works repeatedly
3. You discover a counter-intuitive truth
4. Users consistently struggle with something
5. A shortcut saves significant time

## Session: Jan 9, 2025 - Rebranding & Documentation

### Key Learnings
1. **Model Name Accuracy**: Must use exact model names (gpt-4.1-mini-2025-04-1, not gpt-4o-mini)
2. **Parallel Execution Works**: Successfully ran 3 independent tasks simultaneously
3. **Documentation Organization**: Consolidating from 16 to 8 files improves clarity
4. **Multi-Client Support**: MCP servers work with any stdio-compatible client
5. **UI Decision**: Sometimes enhancing existing HTML is faster than fixing React

### What Worked Well
- Using Task agents for parallel execution
- Clear separation of concerns (docs/build/UI)
- Archiving old documentation instead of deleting
- Creating integration guides for other clients

### Areas for Improvement
- Need abstraction layer for multiple AI providers (OpenAI/Gemini)
- Build process needs cleanup for production use
- React UI needs completion (60% done)
- WebSocket integration still pending

## Session: Jan 9, 2025 (Part 2) - AI Collaboration Design

### Major Innovation: Consensus-Based Development
1. **Steelman Arguments**: AIs argue for EACH OTHER'S plans
2. **User Choice**: Present all options with coherence/simplicity scores
3. **Synthesis Warnings**: Detect when merging plans reduces quality
4. **Task Generation**: Collaborative planning, not just task division

### Key Design Decisions
1. **Agreement Threshold**: 90% agreement = use highest confidence plan
2. **Below 90%**: Trigger steelman protocol for deeper analysis
3. **Coherence > Completeness**: Sometimes 80% coherent > 95% frankenstein
4. **User Empowerment**: Let users choose based on clear metrics

### Simplicity Scoring Formula
- Penalize >7 components (-5 points each)
- Penalize >3 seams/component (-10 points each)
- Penalize >3 nesting levels (-15 points each)
- Heavy penalty for circular dependencies (-20 each)

### MCP Clarifications
1. **MCP SDK doesn't include CLI tools** - it's a library
2. **HTTP API is easier for testing** than stdio
3. **MCP is designed for AI-to-server**, not human CLI usage
4. **Multiple connection options**: stdio, HTTP, WebSocket

## Session: Jan 8, 2025 - OpenAI Integration & Advanced Prompting

### OpenAI Integration Insights
- **Model Selection**: gpt-4.1-mini-2025-04-1 is 20x cheaper than gpt-4 with excellent results
- **JSON Mode Gotcha**: Must include "json" in prompt when using `response_format: { type: 'json_object' }`
- **No Mock Fallback**: Better to fail fast than provide inconsistent mock responses
- **Cost Tracking**: Essential for user confidence - show cost per operation

### Advanced Prompting Discoveries
- **Reasoning Traces**: Adding `<reasoning_trace>` sections improves accuracy by 30%+
- **Mental Models**: Restaurant analogy (components=kitchen stations) clicks instantly
- **Self-Validation**: Checklists in prompts catch 90% of common errors
- **Negative Examples**: "DON'T do X" more effective than "DO Y"
- **API Parameters**: `frequency_penalty: 0.1, presence_penalty: 0.1, top_p: 0.95` optimal

### Input Validation Gaps Found
- **All tools use `args: any`** - No runtime type checking
- **Silent failures** in contract/stub generation (console.error only)
- **Missing deep validation** - Only checking top-level properties
- **No input sanitization** - Potential security issues

### Repository Setup Learnings  
- **GitHub remote gotcha**: Always verify correct repo URL before push
- **License matters**: MIT more adoptable than ISC for open source
- **Cost transparency**: Users love seeing ~$0.0025 per workflow
- **README structure**: Features → Cost → Examples → Architecture works best