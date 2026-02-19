# Roadmap

## Current Status

### ✅ Completed
- **Deploy script** - Matches workflow by commit SHA
- **Integration tests** - Playwright E2E tests with console error detection
- **Local validation** - `npm run check` (test + lint + build)
- **Hardening** - `npm run harden` (security, bundle size, accessibility)
- **TDD workflow** - Agent guidance in AGENTS.md
- **Firestore rules** - Deployed and working
- **E2E tests** - Console error detection for Firebase issues
- **Staging environment** - Separate Firebase project with auto-deploy
- **Production environment** - Release-based manual deploy
- **Environment banners** - Visual distinction between staging/production
- **ADR documentation** - Decision record for automation workflow

### 🔲 Next
- **Enhanced security audit** - Beyond npm audit (Snyk, Dependabot alerts, etc.)

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
| `npm run harden` | Pre-deploy checks (audit, bundle size, a11y) |
| `npm run build` | Production build |
| `npm run deploy` | Deploy to staging (auto on push to main) |
| `npm run integration-test` | Run E2E tests on staging |
| `git tag v0.x.x && git push --tags` | Deploy to production |

---

## Environment URLs

| Environment | URL | Trigger |
|------------|-----|---------|
| Local | http://localhost:3000 | `npm start` |
| Staging | https://argbase-staging.web.app | Push to main |
| Production | https://argbase.org | GitHub release |
