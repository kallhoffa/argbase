# SecureAgentBase Framework

A React + Firebase app framework with autonomous agent workflow, feature flags, and production-grade CI/CD.

## Quick Start

### 1. Fork This Template

Fork this repository to start your own app.

### 2. Configure Firebase

```bash
# Create Firebase projects
firebase projects:create your-app-staging
firebase projects:create your-app-prod

# Set aliases
firebase use --add your-app-staging
firebase use --add your-app-prod
```

### 3. Update Configuration

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_PROJECT_ID` | Production project ID |
| `VITE_FIREBASE_PROJECT_ID_STAGING` | Staging project ID |
| `VITE_STAGING_URL` | Staging deployment URL |
| `VITE_PRODUCTION_URL` | Production URL |
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking (optional) |
| `VITE_FEATURE_FLAG_KEY` | Your primary feature flag key |

### 4. Update App Config

Edit `src/shared/config/app.config.js`:

```javascript
export const appConfig = {
  name: 'YourApp',
  description: 'Your app description',
  
  featureFlags: {
    your_flag_key: {
      control: 'YourApp',
      beta: 'YourApp (beta)',
      next: 'YourApp (next)',
    },
  },
  
  firestore: {
    usersCollection: 'users',
    // Add your app-specific collections
  },
  
  firebase: {
    stagingProject: 'your-app-staging',
    productionProject: 'your-app-prod',
  },
  
  urls: {
    staging: 'https://your-staging.web.app',
    production: 'https://your-production.com',
  },
};
```

### 5. Update Firebase Config

Edit `firebase.json` with your project IDs.

### 6. Deploy

```bash
# Push to main → auto-deploys to staging
git push origin main

# Create tag → deploys to production
git tag v0.1.0 && git push origin v0.1.0
```

---

## Framework Architecture

### Directory Structure

```
src/
├── framework/              # Reusable framework code
│   ├── firestore-utils/   # Auth + Remote Config
│   ├── hooks/            # Feature flag hooks
│   └── config/           # Framework configuration
│
├── app/                   # Your app code
│   ├── components/       # React components
│   ├── pages/            # Page components
│   └── firestore-utils/  # App-specific Firestore code
│
└── shared/
    └── config/           # Shared configuration
        └── app.config.js # App-specific config

scripts/
├── framework/             # Framework scripts
│   ├── deploy.cjs
│   ├── harden.cjs
│   └── validate-remote-config.cjs
└── app/                  # App-specific scripts

.github/
├── framework/             # Framework workflows
│   ├── deploy-staging.yml
│   ├── deploy-production.yml
│   └── codeql.yml
└── workflows/           # App workflows
```

### Schema Markers

| Marker | Meaning |
|--------|---------|
| `[FRAMEWORK]` | Reusable across any React/Firebase app |
| `[APP]` | Specific to your application |

---

## Feature Flags

### Overview

The framework includes a feature flag system using Firebase Remote Config + localStorage caching.

### Defining Flags

In `src/shared/config/app.config.js`:

```javascript
featureFlags: {
  your_flag: {
    control: 'Default experience',
    beta: 'Beta experience',
    next: 'Next feature',
  },
}
```

### Using Flags

```javascript
import { useFeatureFlag } from './framework/hooks/useFeatureFlag';

const { flagValue, loading } = useFeatureFlag('your_flag');
```

### Rollout Strategy

| Segment | Treatment |
|---------|-----------|
| Staging | Always gets `beta` |
| Beta opt-in users | Gets `beta` |
| 10% random bucket | Gets `next` |
| Stable (85%) | Gets `control` |

---

## CI/CD Pipeline

### Staging (Automatic)

```
Push to main → Build → Deploy → Smoke Tests → Full E2E Tests
```

### Production (Manual)

```
Create git tag → Build → Deploy → Smoke Tests → Full E2E Tests
```

### Required Secrets

In GitHub repository settings, add:

| Secret | Description |
|--------|-------------|
| `FIREBASE_TOKEN_STAGING` | Firebase CI token for staging |
| `FIREBASE_TOKEN` | Firebase CI token for production |
| `FIREBASE_API_KEY` | Firebase API key |

| Variable | Description |
|----------|-------------|
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | Production project ID |
| `FIREBASE_PROJECT_ID_STAGING` | Staging project ID |
| `VITE_USE_FIREBASE_EMULATOR` | Set to 'true' for staging |

---

## Testing

### Unit Tests

```bash
npm test              # Watch mode
npm run test:ci       # CI mode
```

### E2E Tests

```bash
npm run e2e          # Local
npm run e2e:ci       # CI mode
npm run e2e:smoke    # Smoke tests only
```

### Pre-push Hook

Running `git push` automatically runs `npm run check` (test + lint + build).

---

## Error Tracking (Sentry)

### Setup

1. Create Sentry project
2. Add `VITE_SENTRY_DSN` to GitHub variables
3. Add `SENTRY_AUTH_TOKEN` to GitHub secrets (for source maps)

### What's Tracked

- Uncaught exceptions
- React component errors (ErrorBoundary)
- Performance traces (10% sample)
- Session replays on errors

---

## Updating the Framework

When the parent template updates, pull changes:

```bash
# Add parent as remote
git remote add framework git@github.com:kallhoffa/SecureAgentBase.git

# Fetch updates
git fetch framework

# Merge (or rebase)
git merge framework/main
```

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run check` | Full validation (test + lint + build) |
| `npm run e2e:smoke` | Run smoke tests |
| `npm run copy-framework` | Copy framework files to parent repo |
| `npm run deploy` | Deploy to staging |
| `npm run harden` | Run security/quality checks |

---

## License

MIT
