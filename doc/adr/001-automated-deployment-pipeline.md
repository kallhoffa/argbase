# ADR 001: Automated Deployment Pipeline with Staging and Production Environments

## Status
Accepted

## Date
2026-02-19

## Context
We need a deployment workflow that provides:
- Automatic preview deployments for changes
- Manual production deployments for control
- Integration testing at each stage
- Physical control to prevent unplanned releases

## Decision

### Environments

| Environment | URL | Trigger |
|------------|-----|---------|
| Staging | https://argbase-staging.web.app | Push to main (auto) |
| Production | https://argbase.org | GitHub release (manual) |

### Workflow

1. **Development**
   - Work on feature branches
   - Use TDD: write test first, then code
   - Validate with `npm run check` (test + lint + build)

2. **Staging Deployment** (automatic)
   - Push to main branch
   - GitHub Actions auto-deploys to staging
   - Integration tests run automatically on staging
   - Environment banner shown on staging

3. **Production Deployment** (manual)
   - Create GitHub release: `git tag v0.x.x && git push --tags`
   - GitHub Actions deploys to production
   - Integration tests run on production

### Components

- **Firebase**: Separate projects for staging and production
- **GitHub Actions**:
  - `firebase-deploy-staging.yml`: Runs on push to main
  - `firebase-deploy.yml`: Runs on release published
- **Scripts**:
  - `npm run deploy`: Pushes to main (triggers staging)
  - `npm run check`: test + lint + build
  - `npm run harden`: security audit, bundle size, accessibility
  - `npm run integration-test`: E2E tests

### Agent Constraints (AGENTS.md)

- NEVER run deploy commands without explicit user approval
- ALWAYS ask for confirmation before deployment operations
- Use TDD - write test first, then code
- Run `npm run check` before committing

## Consequences

### Positive
- Automatic staging deployments allow rapid iteration
- Manual production releases prevent unplanned deployments
- Integration tests catch issues before production
- Environment banners clearly distinguish staging vs production
- Agent constraints prevent autonomous deployments

### Negative
- More complex setup than simple push-to-deploy
- Requires separate Firebase projects
- Two different URLs to manage

## References

- AGENTS.md - Agent constraints and workflow
- docs/roadmap.md - Implementation status
- .github/workflows/ - CI/CD configuration
