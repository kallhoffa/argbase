* Finish automation - desired development flow is user saying "lets work on next roadmap feature" and opencode agent running on loop, pausing for questions, until functionality is deployed and tested on production. including local testing, hardening, deployment, integration testing.
  * add try loop for local testing
  * add try loop for integration testing
* **Automation Plan**

  ## Configuration (config/automation.json)
  ```json
  {
    "maxRetries": {
      "localTests": 3,
      "build": 2,
      "deployment": 5,
      "integrationTests": 3
    },
    "pausePoints": ["afterLocalTests", "onAmbiguous"],
    "integrationTestUrl": "https://argbase.web.app"
  }
  ```

  ## Scripts to Create

  ### 1. `scripts/develop.js` - Local Dev Loop
  - Watch source files for changes
  - Run `npm test -- --watchAll=false` on each change
  - Run `npm run build` to catch build errors
  - Run `npx eslint src/` for linting
  - Retry loop with `config.maxRetries.localTests` attempts
  - **Pause for user questions** after local tests pass

  ### 2. `scripts/harden.js` - Pre-deployment Checks
  - Run `npm audit` for security vulnerabilities
  - Accessibility checks with axe-core
  - Bundle size validation
  - Retry loop with `config.maxRetries.build` attempts

  ### 3. `scripts/integration-test.js` - E2E Tests (DONE)
  - Install Playwright: `npm install -D @playwright/test` ✓
  - Add playwright config for CI ✓
  - Create `tests/e2e/*.spec.js` for critical user flows ✓
  - Run against deployed URL (config.integrationTestUrl) or localhost
  - Retry loop with `config.maxRetries.integrationTests` attempts
  - Run with `npm run integration-test` or `node scripts/integration-test.js`

  ### 4. `scripts/workon.js` - Feature Orchestrator
  - Create feature branch from main
  - Coordinate: local tests → harden → commit → push → deploy → integration test
  - **Pause for user questions** when:
    - After local tests pass (confirm before proceeding)
    - When intent is ambiguous (e.g., "fix the thing" - ask which thing)
  - Retry loop with `config.maxRetries.deployment` attempts
  - Auto-fix common errors (eslint, missing deps, similar to deploy.js)

  ## Workflow Example
  ```
  User: "lets work on adding user profiles"

  Agent loop:
  1. Create branch: feature/user-profiles
  2. Run develop.js (local test loop)
     → Pause: "Local tests passing. Proceed to deployment?"
  3. Run harden.js (security/accessibility)
  4. Commit & push
  5. Run deploy.js (existing)
  6. Run integration-test.js (Playwright)
     → Success: "Deployed and tested!"
     → Failure: Auto-fix retry OR pause: "Tests failed. Fix or abort?"
  ```

  ## Implementation Order
  1. Create `config/automation.json` with retry limits (skip - using defaults in script)
  2. Add Playwright to package.json ✓
  3. Create `scripts/develop.js` (next)
  4. Create `scripts/harden.js`
  5. Create `scripts/integration-test.js` ✓
  6. Update `scripts/workon.js` (or create it)
  7. Write initial E2E tests for critical paths ✓
