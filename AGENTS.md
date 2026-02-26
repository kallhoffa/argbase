# AGENTS.md - ArgBase Development Guide

AI agent guidance for the ArgBase repository. Built with React, Firebase, and TailwindCSS.

---

## Agent Constraints

- **NEVER** run `npm run deploy`, `git push`, or deployment commands without explicit user approval
- **ALWAYS** ask for confirmation before executing deployment-related operations

---

## Commands

```bash
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run unit tests in watch mode
npm run test:ci      # Run all tests once
npm test -- path/to/test.test.js   # Run single test file
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run check        # Full validation: test → lint → build
npm run harden       # Pre-deploy security and quality checks
npm run deploy       # Deploy to staging (requires approval)
```

---

## Code Style

### General
- Write clean, readable code with minimal complexity
- Avoid premature abstraction; keep components focused
- **No comments** unless explicitly requested

### File Organization
| Type | Location |
|------|----------|
| React components | `src/*.jsx` |
| Component tests | `src/_tests_/*.test.jsx` |
| Firestore utils | `src/firestore-utils/*.js` |
| Feature flags | `src/config/featureFlags.js` |
| Custom hooks | `src/hooks/*.js` |
| Scripts | `scripts/*.js` |

### Imports (order)
1. External libraries (React, react-router-dom, firebase)
2. Internal components/utils
3. CSS/styles
4. Assets/images

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `NavigationBar` |
| Functions | camelCase | `handleSubmit` |
| Constants | PascalCase | `MAX_ATTEMPTS` |
| Files | kebab-case | `navigation-bar.js` |

### React Component Structure
```javascript
import React from 'react';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState('');

  const handleEvent = () => { /* ... */ };

  return <div className="...">...</div>;
};

export default ComponentName;
```

### Error Handling
```javascript
try {
  const docRef = await addDoc(collection, data);
  return docRef.id;
} catch (error) {
  console.error('Error storing question:', error);
  throw error;
}
```

### JSDoc for Firestore Functions
```javascript
/**
 * @param {import('firebase/firestore').Firestore} db
 * @param {Question} questionData
 * @returns {Promise<string>}
 */
export const storeQuestion = async (db, questionData) => { /* ... */ };
```

### TailwindCSS
- Use utility classes only (no custom CSS)
- Use responsive prefixes: `md:`, `lg:`, etc.

### Testing
- Test files: `src/_tests_/*.test.js`
- Use `@testing-library/react`
- Wrap components with `BrowserRouter` for `useNavigate`:
```javascript
const renderWithRouter = (component) => render(
  <BrowserRouter>{component}</BrowserRouter>
);
```

---

## Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Write test first (TDD)
3. Write minimum code to pass
4. Run `npm run check` before committing
5. Commit: `git commit -m "feat: description"`
6. Push and create PR

---

## E2E Testing
```bash
npm start
TEST_URL=http://localhost:3000 npx playwright test tests/e2e
npm run integration-test  # Production
```

## CI/CD
- Push to `main` auto-deploys to staging (https://argbase-staging.web.app)
- Create git tag `v0.x.x` and push to deploy to production (https://argbase.org)

---

## Firebase Auth

To add authentication to components:
```javascript
import { useAuth } from './firestore-utils/auth-context';

const Component = () => {
  const { user, login, logout } = useAuth();
  if (user) return <div>Logged in as {user.email}</div>;
  return <button onClick={login}>Log In</button>;
};
```

### Local Development with Emulators

1. Start Firebase emulators: `firebase emulators:start`
2. Create `.env.local`: `VITE_USE_FIREBASE_EMULATOR=true`
3. Start dev server: `npm run dev`

| File | Purpose |
|------|---------|
| `.env.example` | Template with placeholder values |
| `.env.local` | Local overrides (gitignored) - use for emulator or staging |

```bash
cp .env.example .env.local
firebase emulators:start  # Terminal 1
npm run dev               # Terminal 2
```

---

## Feature Flags (Firebase Remote Config)

### Rollout Strategy
| Segment | Gets Treatment |
|---------|---------------|
| Staging | All features (always) |
| Beta opt-in users | All `beta_*` features |
| 10% random bucket | Only `next_*` features (one at a time) |
| Stable (85%) | Control (production experience) |

### Flag Values
- `control` = stable/production experience
- `beta` = beta opt-in users only
- `next` = 10% random bucket (testing candidate)

### Adding a New Feature Flag
1. Add flag in Firebase Remote Config console
2. Set default to `control`
3. Add conditions:
   - Staging: `country == 'staging'` → `beta`
   - Beta users: user property `beta_enabled = true` → `beta`
   - 10% bucket: random percentile ≤ 10% → `next`

### Local Testing
```javascript
// In browser console:
window.__FLAG_TEST_MODE__ = { navigation_banner: 'beta' };
window.location.reload();
```

### Files
- `src/config/featureFlags.js` - Flag definitions
- `src/hooks/useFeatureFlag.js` - React hook for accessing flags
- `src/firestore-utils/remote-config.js` - Firebase Remote Config client
