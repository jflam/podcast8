# Implementation Plan: Podcast Player

**Feature Branch**: `001-podcast-player`  
**Created**: 2025-06-23  
**Specification**: [Feature Specification](./feature-spec.md)  

---

## ⚡ Quick Guidelines

**Note**: This document serves two purposes:
1. **As a template** - For AIs/humans creating implementation plans
2. **As a guide** - For AIs/humans executing the implementation

Instructions marked *(for execution)* apply when implementing the feature.
Instructions marked *(when creating this plan)* apply when filling out this template.

- ✅ Mark all technical decisions that need clarification
- ✅ Use [NEEDS CLARIFICATION: question] for any assumptions
- ❌ Don't guess at technical choices without context
- ❌ Don't include actual code - use pseudocode or references
- 📋 The review checklist acts as "unit tests" for this plan
- 📁 Extract details to `implementation-details/` files

---

## Executive Summary *(mandatory)*

A React-based podcast player that displays episodes from the Hanselminutes RSS feed through a card interface, with a Node.js backend to handle CORS and caching. The implementation uses Vite for React scaffolding and Express for the backend API, following constitutional principles of simplicity and library-first development.

## Requirements *(mandatory)*

**Minimum Versions**: Node.js 18+, npm 9+  
**Dependencies**: React 18+, Vite, Express, RSS Parser  
**Technology Stack**: 
- Frontend: React + JavaScript + Vite
- Backend: Node.js + Express
- Cache: In-memory (development), Redis (production optional)
- Testing: Vitest + Playwright
**Feature Spec Alignment**: [x] All requirements addressed

---

## Constitutional Compliance *(mandatory)*

*Note: The Constitution articles referenced below can be found in `/memory/constitution.md`. AI agents should read this file to understand the specific requirements of each article.*

### Simplicity Declaration (Articles VII & VIII)
- **Project Count**: 2 (podcast-backend, podcast-player)
- **Model Strategy**: [x] Single model / [ ] Multiple
- **Framework Usage**: [x] Direct / [ ] Abstracted
- **Patterns Used**: [x] None (using framework features directly)

### Testing Strategy (Articles III & IX)
- **Test Order**: Contract → Integration → E2E → Unit
- **Contract Location**: `/contracts/`
- **Real Environments**: [x] Yes / [ ] Mocks
- **Coverage Target**: 80% minimum, 100% critical paths

### Library Organization (Articles I & II)
- **Libraries**: 
  - podcast-backend: RSS fetching, caching, API server
  - podcast-player: React frontend application
- **CLI Interfaces**: 
  - podcast-backend: serve, feed, cache, validate
  - podcast-player: dev, build, preview, test
- **CLI Standards**: All CLIs implement --help, --version, --format
- **Inter-Library Contracts**: HTTP API between frontend and backend

### Observability (Article V)
- [x] Structured logging planned
- [x] Error reporting defined
- [x] Metrics collection (cache hit rates)

---

## Project Structure *(mandatory)*

```
001-podcast-player/
├── implementation-plan.md          # This document (HIGH-LEVEL ONLY)
├── manual-testing.md              # Step-by-step validation instructions
├── implementation-details/         # Detailed specifications
│   ├── 00-research.md             # RSS feed analysis ✓
│   ├── 02-data-model.md           # Episode/Feed schemas ✓
│   ├── 03-api-contracts.md        # API specifications ✓
│   ├── 06-contract-tests.md       # Test specifications ✓
│   └── 08-inter-library-tests.md  # Library boundary tests ✓
├── contracts/                      # API contracts (FIRST)
│   └── api.yaml                   # OpenAPI specification
├── podcast-backend/
│   ├── package.json
│   ├── cli.js                     # CLI entry point
│   ├── server.js                  # Express server
│   ├── lib/
│   │   ├── rss-fetcher.js         # RSS parsing
│   │   ├── cache.js               # Caching logic
│   │   └── proxy.js               # Audio proxy
│   └── tests/
│       ├── contract/              # API contract tests
│       └── integration/           # Service tests
└── podcast-player/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── src/
    │   ├── main.jsx               # React entry
    │   ├── App.jsx                # Main component
    │   ├── components/
    │   │   ├── EpisodeCard.jsx    # Episode display
    │   │   ├── EpisodeDetail.jsx  # Detail view
    │   │   └── AudioPlayer.jsx    # Player controls
    │   └── lib/
    │       └── api-client.js      # Backend communication
    └── tests/
        ├── integration/           # E2E tests
        └── unit/                  # Component tests
```

### File Creation Order
1. Create directory structure
2. Create `contracts/api.yaml` with OpenAPI specification
3. Create contract tests in `podcast-backend/tests/contract/`
4. Create backend implementation to pass contract tests
5. Create frontend scaffolding with Vite
6. Create frontend components and integration
7. Create `manual-testing.md` for E2E validation

**IMPORTANT**: This implementation plan should remain high-level and readable. Any code samples, detailed algorithms, or extensive technical specifications must be placed in the appropriate `implementation-details/` file and referenced here.

---

## Implementation Phases *(mandatory)*

### Phase -1: Pre-Implementation Gates

#### Technical Unknowns
- [x] Complex areas identified: RSS feed structure analyzed
- [x] Research completed: See implementation-details/00-research.md
*Research findings: implementation-details/00-research.md*

#### Simplicity Gate (Article VII)
- [x] Using ≤3 projects? (2 projects)
- [x] No future-proofing? (Only current requirements)
- [x] No unnecessary patterns? (Direct framework usage)

#### Anti-Abstraction Gate (Article VIII)
- [x] Using framework directly? (React/Express features)
- [x] Single model representation? (One Episode type)
- [x] Concrete classes by default? (No unnecessary interfaces)

#### Integration-First Gate (Article IX)
- [x] Contracts defined? (OpenAPI spec planned)
- [x] Contract tests written? (Test specs ready)
- [x] Integration plan ready? (HTTP API defined)

### Verification: Phase -1 Complete *(execution checkpoint)*
- [x] All gates passed or exceptions documented in Complexity Tracking
- [x] Research findings documented if applicable
- [x] Ready to create directory structure

### Phase 0: Contract & Test Setup

**Prerequisites** *(for execution)*: Phase -1 verification complete
**Deliverables** *(from execution)*: Failing contract tests, API specifications, test strategy

1. **Define API Contracts**
   ```pseudocode
   Create OpenAPI specification for:
   - GET /api/feed
   - GET /api/feed/refresh  
   - GET /api/proxy/audio
   - GET /api/health
   ```
   *Details: implementation-details/03-api-contracts.md*

2. **Write Contract Tests**
   ```pseudocode
   Test each endpoint for:
   - Response structure validation
   - Error handling
   - CORS headers
   - Cache headers
   ```
   *Detailed test scenarios: implementation-details/06-contract-tests.md*

3. **Design Integration Tests**
   ```pseudocode
   - Frontend loads episodes
   - Audio playback through proxy
   - Cache behavior
   - Error recovery
   ```
   *Test strategy details: implementation-details/06-contract-tests.md*
   *Inter-library tests: implementation-details/08-inter-library-tests.md*

4. **Create Manual Testing Guide**
   - Map each user story to validation steps
   - Document setup/build/run instructions
   - Create step-by-step validation procedures
   *Output: manual-testing.md*

### Verification: Phase 0 Complete *(execution checkpoint)*
- [ ] API contracts exist in `/contracts/`
- [ ] Contract tests written and failing
- [ ] Integration test plan documented
- [ ] Manual testing guide created
- [ ] All detail files referenced exist

### Phase 1: Core Implementation

**Prerequisites** *(for execution)*: Phase 0 verification complete
**Deliverables** *(from execution)*: Working implementation passing all contract tests

1. **Backend Implementation**
   - Create Express server with CORS support
   - Implement RSS fetching with simplecast feed
   - Add in-memory cache with TTL
   - Create audio proxy endpoint
   - Add CLI interface per Article II

2. **Frontend Implementation**
   - Scaffold with Vite: `npm create vite@latest podcast-player -- --template react`
   - Create Episode and Feed models matching backend
   - Implement card-based episode list
   - Add episode detail view with player
   - Create audio player component

3. **Integration Implementation**
   - Connect frontend to backend API
   - Handle loading and error states
   - Implement cache-first loading
   - Add audio playback through proxy

### Phase 2: Refinement

**Prerequisites** *(for execution)*: Phase 1 complete, all contract/integration tests passing
**Deliverables** *(from execution)*: Production-ready code with full test coverage

1. **Unit Tests** (only for complex logic like RSS parsing)
2. **Performance Optimization** (measure first, optimize if needed)
3. **Documentation Updates**
4. **Manual Testing Execution**
   - Follow manual-testing.md procedures
   - Verify all user stories work E2E
   - Document any issues found

### Verification: Phase 2 Complete *(execution checkpoint)*
- [ ] All tests passing (contract, integration, unit)
- [ ] Manual testing completed successfully
- [ ] Performance metrics meet requirements
- [ ] Documentation updated

---

## Success Criteria *(mandatory)*

1. **Constitutional**: All gates passed
2. **Functional**: All user stories implemented
3. **Testing**: 80%+ coverage, 100% critical paths
4. **Performance**: <3s page load, <2s audio start
5. **Simplicity**: Only 2 projects, no abstractions

---

## Review & Acceptance Checklist

### Plan Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] All mandatory sections completed
- [x] Technology stack fully specified
- [x] Dependencies justified or none added

### Constitutional Alignment
- [x] All Phase -1 gates passed or exceptions documented
- [x] Deviations recorded in Complexity Tracking section

### Technical Readiness
- [ ] Phase 0 verification complete
- [ ] Phase 1 implementation path clear
- [ ] Success criteria measurable

### Risk Management
- [x] Complex areas identified and researched
- [x] Integration points clearly defined
- [x] Performance requirements specified
- [x] Security considerations addressed (HTTPS only)

### Implementation Clarity
- [x] All phases have clear prerequisites and deliverables
- [x] No speculative or "might need" features
- [ ] Manual testing procedures defined

---

*This plan follows Constitution v2.0.0 (see `/memory/constitution.md`) emphasizing simplicity, framework trust, and integration-first testing.*