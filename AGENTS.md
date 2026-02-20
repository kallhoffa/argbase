# AGENTS.md - ArgBase Development Guide

AI agent guidance for the ArgBase repository.

## Project Overview

ArgBase is a knowledge platform for structured arguments and evidence. Built with React, Firebase, and TailwindCSS.

---

## Agent Constraints

- **NEVER** run `npm run deploy`, `git push`, or deployment commands without explicit user approval
- **ALWAYS** ask for confirmation before executing deployment-related operations

---

## Commands

```bash
npm start              # Start dev server at http://localhost:3000
npm run build          # Build for production
npm test               # Run all tests in watch mode
npm test -- --watchAll=false                    # Run all tests once
npm test -- --watchAll=false --testPathPattern="navigation"  # Run single test file
npm run lint           # Run ESLint
npm run lint:fix       # Auto-fix ESLint issues
npm run check          # Full validation: test → lint → build
```

---

## Code Style

### General
- Write clean, readable code with minimal complexity
- Avoid premature abstraction
- Keep components focused and single-purpose
- **No comments** unless explicitly requested

### File Organization
| Type | Location |
|------|----------|
| React components | `src/*.js` |
| Component tests | `src/_tests_/*.test.js` |
| Firestore utils | `src/firestore-utils/*.js` |
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
| CSS classes | Tailwind utilities | `bg-blue-600` |

### React Component Structure

```javascript
import React from 'react';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState('');

  const handleEvent = () => { /* ... */ };

  return (
    <div className="...">
      ...
    </div>
  );
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

### JSDoc Documentation
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
# Local dev server
npm start
TEST_URL=http://localhost:3000 npx playwright test tests/e2e

# Production
npm run integration-test
```

---

## CI/CD

- Push to `main` auto-deploys to staging (https://argbase-staging.web.app)
- Create git tag `v0.x.x` and push to deploy to production (https://argbase.org)
