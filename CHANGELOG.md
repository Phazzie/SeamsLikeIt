# Changelog

All notable changes to the SeamsLikeIt MCP Server project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-01-11

### Added
- TYPE_UNIFICATION_GUIDE.md for aligning collaboration and core types
- Complete rewrite of proposePlanTool following SDD principles
- Enhanced error recovery with JSON repair attempts
- Optimal AI parameters for reliable JSON generation

### Changed
- Unified type system between collaboration.ts and sdd.ts
- ErrorScenarioSchema now matches core sdd.ts structure
- Improved prompt engineering with exact JSON examples
- Clear division of labor in AI collaboration

### Fixed
- Type mismatch between SeamDefinition structures
- ErrorScenario field naming (scenario → condition)
- ValidationRule missing errorMessage field
- ComponentDefinition field inconsistencies

### Learned
- Regeneration beats debugging for complex issues
- Show exact JSON structure in prompts, don't just describe
- Type unification prevents integration issues
- Clear AI role division improves efficiency

## [1.0.1] - 2025-01-10

### Added
- UI_CONTRACT.md defining complete frontend-backend seam
- UI_DECISION_POINT_CONTRACT.md for user decision interface
- CLAUDE_GEMINI_COMMUNICATION.md for AI collaboration
- Circular dependency detection fix in scoring.ts
- JSON parsing error handling in http-server-secure.ts
- "Final Check" prompt engineering technique

### Changed
- Collaboration workflow now user-driven (not auto-synthesis)
- AI recommends (SYNTHESIZE, CHOOSE_A, CHOOSE_B) but user decides
- Fixed TypeScript syntax errors with backticks in templates
- PM2 process management for HTTP server stability

### Fixed
- Circular dependency bug counting same cycle multiple times
- JSON parsing errors when AI returns plain text
- Syntax errors in propose-plan.ts prompt
- Missing prompt files (already existed)

### Learned
- **Critical**: Follow SDD principle "regenerate don't debug" even when tempting
- Synthesis isn't always better - coherent single plan can beat mashup
- User empowerment > automatic decisions
- Contract-first development enables parallel work
- "Final Check" instructions improve AI JSON generation reliability

## [1.0.0] - 2025-01-09

### Added
- Complete rebranding from SDD to SeamsLikeIt
- Gemini CLI integration support (GEMINI_INTEGRATION.md)
- Parallel execution capabilities (30-40% performance improvement)
- Modern UI with gradient effects and animations
- WebSocket support for real-time progress tracking
- Cost tracking and transparency features
- AI Collaboration design with steelman arguments (AI_COLLABORATION_V2.md)
- Seam-Driven insights section in UI
- Best practices from real-world usage in documentation

### Changed
- All tool names from `sdd_*` to `seam_*`
- Model updated to gpt-4.1-mini-2025-04-1
- Documentation uses "Seam-Driven Development" consistently
- Improved error handling and type safety
- Documentation consolidated from 16 to 8 essential files

### Fixed
- TypeScript compilation issues
- UI button handlers now properly wired
- Security vulnerabilities in test HTML files
- Gemini connection clarifications (GEMINI_CONNECTION_SOLUTION.md)

## [0.9.0] - 2025-01-08

### Added
- CLAUDE.md with comprehensive AI instructions and SDD principles
- CHANGELOG.md for tracking project evolution
- LESSONS_LEARNED.md for capturing insights
- ROADMAP.md with short/medium/long term planning
- .env.example with complete configuration options
- SESSION_RECAP.md for context window turnover
- Documentation update command ("update-sdd-docs") concept
- dotenv import for configuration management

### Changed
- Shifted from "perfect AI" mindset to "iterate and validate" approach
- Embraced regeneration over debugging as core principle
- Fixed module system (removed ES modules conflict)
- Made server startable with proper CommonJS configuration

### Fixed
- All TypeScript compilation errors in validate-integration.ts
- Module system configuration (CommonJS vs ES modules)
- Jest configuration for CommonJS compatibility
- Server now starts successfully

### Learned
- Current AI capabilities are sufficient with clever prompt engineering
- Multi-pass seam detection more effective than single perfect attempt
- Over-identifying seams then consolidating works better
- Moneyball thinking: find value where others see limitations
- Module system conflicts can prevent server startup

## [2024-01-07] - Initial Implementation

### Added
- Core MCP server structure with TypeScript
- Five essential SDD tools:
  - `sdd_analyze_requirements` - Transform requirements to components/seams
  - `sdd_generate_contracts` - Create TypeScript interfaces
  - `sdd_create_stubs` - Generate implementation blueprints
  - `sdd_validate_integration` - Test component communication
  - `sdd_orchestrate_simple` - Run complete workflow
- Domain-specific modules:
  - Healthcare (HIPAA, HL7, audit trails)
  - E-commerce (PCI, inventory, cart workflows)
  - Fintech (financial precision, compliance, KYC)
- Comprehensive type system with ContractResult<T> pattern
- Mock AI client for development
- Jest testing framework
- Example projects documentation

### Technical Decisions
- TypeScript for type safety
- MCP protocol for Claude integration
- Domain-driven design for specialized contexts
- ContractResult<T> pattern for all cross-component communication

### Known Issues
- TypeScript compilation errors in validate-integration.ts
- AI client using mocks instead of real AI service
- No production configuration management

### Learned
- SDD principles translate well to practical implementation
- Domain-specific patterns significantly improve component detection
- Blueprint-based development perfect for AI assistance
- Integration validation can be automated effectively

## [2024-01-06] - Project Inception

### Added
- Initial requirements document from dual perspective (Sarah & Marcus)
- Core SDD methodology definition
- Vision for democratizing software development

### Conceptualized
- "Integration debugging consumes 40-60% of development time"
- "I don't debug because I can't debug" philosophy
- Seams as first-class architectural citizens
- ContractResult<T> pattern for integration safety

### Learned
- Non-technical users need fundamentally different approaches
- Regeneration can be faster than debugging
- Clear contracts enable reliable AI implementation
- Domain expertise matters more than coding ability