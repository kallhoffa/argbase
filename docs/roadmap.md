* Finish automation - desired development flow is user saying "lets work on next roadmap feature" and opencode agent running on loop, pausing for questions, until functionality is deployed and tested on production. including local testing, hardening, deployment, integration testing.

## Current Status

### ✅ Completed
- **Deploy script** - Matches workflow by commit SHA, prompts for confirmation before push
- **Integration tests** - Playwright E2E tests with console error detection
- **Local validation** - `npm run check` (test + lint + build)
- **TDD workflow** - Agent guidance in AGENTS.md
- **Firestore rules** - Deployed and working

### 🔲 Remaining
- `scripts/harden.js` - Pre-deployment security/accessibility checks
- `scripts/workon.js` - Feature orchestrator (optional - agent handles this)

---

## Scripts

### `npm run check` - Local Validation
```bash
npm run check   # Runs: test (ci mode) → lint → build
```
Validates code before committing or deploying.

### `npm run integration-test` - E2E Tests
```bash
npm run integration-test   # Runs against https://argbase.org
TEST_URL=http://localhost:3000 npm run integration-test  # Local
```
Runs Playwright E2E tests against production or local.

### `npm run deploy` - Deploy to Production
```bash
npm run deploy   # Prompts for confirmation, waits for workflow, auto-fixes errors
```
Builds, deploys to Firebase, runs integration tests.

---

## Development Workflow

1. **Local Development**: Agent uses TDD - write test first, then code
2. **Validate**: `npm run check` (or `npm run test:ci && npm run lint`)
3. **Deploy**: `npm run deploy` (requires user approval)
4. **Verify**: `npm run integration-test`

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server |
| `npm run test` | Run tests in watch mode |
| `npm run test:ci` | Run tests once (CI mode) |
| `npm run lint` | Lint source files |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run check` | Full validation (test + lint + build) |
| `npm run build` | Production build |
| `npm run deploy` | Deploy to production |
| `npm run integration-test` | Run E2E tests on production |

---

## E2E Tests

Tests are in `tests/e2e/` and run with Playwright.

```bash
# Production
npx playwright test tests/e2e

# Local
TEST_URL=http://localhost:3000 npx playwright test tests/e2e
```

### Test Coverage
- Home page loads
- Search functionality
- Question page loading states
- Error handling and console error detection

---

## Agent Constraints (from AGENTS.md)

- **NEVER** run `npm run deploy`, `git push`, or any deployment commands without explicit user approval
- **ALWAYS** ask for confirmation before executing deployment-related operations
- **Always use TDD** - Write test first, then code
- **Run `npm run check`** before committing to validate everything
