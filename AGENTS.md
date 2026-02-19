# AGENTS.md - ArgBase Development Guide

This file provides guidance for AI agents operating in the ArgBase repository.

## Project Overview

ArgBase is a knowledge platform for structured arguments and evidence. Built with React, Firebase, and TailwindCSS.

---

## Commands

### Development
```bash
npm start              # Start development server at http://localhost:3000
```

### Building
```bash
npm run build          # Build for production (auto-updates browserslist)
```

### Testing
```bash
npm test                           # Run all tests in watch mode
npm test -- --watchAll=false      # Run all tests once
npm test -- --watchAll=false --testPathPattern="navigation"  # Run single test file
```

### Deployment
```bash
npm run deploy    # Push changes, run CI, auto-fix errors (max 5 attempts)
```

---

## Code Style Guidelines

### General Principles
- Write clean, readable code with minimal complexity
- Avoid premature abstraction - prefer simple solutions
- Keep components focused and single-purpose

### File Organization
- React components: `src/*.js`
- Component tests: `src/_tests_/*.test.js`
- Utility functions: `src/firestore-utils/*.js`
- Scripts: `scripts/*.js`

### Imports

**Order (recommended):**
1. External libraries (React, react-router-dom, firebase)
2. Internal components/utils
3. CSS/styles
4. Assets/images

```javascript
// Good
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { collection, query, where } from 'firebase/firestore';

import NavigationBar from './navigation-bar';
import Home from './home';

import './App.css';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `NavigationBar`, `QuestionPage` |
| Functions | camelCase | `storeQuestion`, `handleSubmit` |
| Constants | PascalCase | `MAX_ATTEMPTS`, `API_URL` |
| Files | kebab-case | `navigation-bar.js`, `firestore-question-storage.js` |
| CSS classes | kebab-case (Tailwind) | `bg-blue-600`, `text-center` |

### React Patterns

**Component Structure:**
```javascript
import React from 'react';

const ComponentName = ({ prop1, prop2 }) => {
  // Hooks first
  const [state, setState] = useState('');
  
  // Event handlers
  const handleEvent = () => {
    // ...
  };
  
  // Render
  return (
    <div className="...">
      ...
    </div>
  );
};

export default ComponentName;
```

**Props:**
- Use destructuring for props
- Provide default props when appropriate
- Document complex props with JSDoc

```javascript
const NavigationBar = ({ navigate: navigationOverride }) => {
  const defaultNavigate = useNavigate();
  const navigate = navigationOverride || defaultNavigate;
  // ...
};
```

### Error Handling

- Use try/catch for async operations
- Always re-throw errors after logging
- Provide meaningful error messages

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

Document public functions with JSDoc comments:

```javascript
/**
 * Stores a new question with its answers in Firestore
 * @param {import('firebase/firestore').Firestore} db - Firestore database instance
 * @param {Question} questionData - The question data to store
 * @returns {Promise<string>} The ID of the newly created question document
 */
export const storeQuestion = async (db, questionData) => {
  // ...
};
```

### Type Definitions (JSDoc)

Use JSDoc `@typedef` for complex types:

```javascript
/**
 * @typedef {Object} Answer
 * @property {string} content - The answer text
 * @property {number} upvotes - Number of upvotes
 * @property {number} downvotes - Number of downvotes
 * @property {string} author - Username of answer author
 * @property {Comment[]} comments - Array of comments
 */
```

### TailwindCSS Usage

- Use utility classes for all styling (no custom CSS unless necessary)
- Follow Tailwind's default color scale
- Use responsive prefixes: `md:`, `lg:`, etc.

```javascript
// Good
<div className="flex items-center justify-between h-16">

// Avoid custom CSS
<div className="navbar">
```

### Firebase/Firestore

- Use Firestore utility functions from `src/firestore-utils/`
- Always handle errors in async database operations
- Use timestamps: `Timestamp.now()` from firebase/firestore

### Testing

- Test files: `src/_tests_/*.test.js`
- Use `@testing-library/react` for component tests
- Use `jest.fn()` for mocks
- Include router wrapper for components using `useNavigate`:

```javascript
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};
```

### Git Conventions

- Commit message format: `type: description`
- Types: `feat`, `fix`, `test`, `docs`, `deploy`
- Example: `deploy: auto-fix errors`, `Add test suite for NavigationBar`

---

## Common Patterns

### Form Submission
```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    navigate(`/question?q=${encodeURIComponent(searchQuery.trim())}`);
  }
};
```

### Conditional Rendering
```javascript
// Simple conditions
if (!isLocalhost) return null;

// JSX conditions
{status === 'loading' ? <Spinner /> : <Content />}
```

### State with Side Effects
```javascript
useEffect(() => {
  const fetchData = async () => {
    // fetch logic
  };
  fetchData();
}, [dependency]);
```

---

## CI/CD

GitHub Actions (`.github/workflows/firebase-deploy.yml`):
- Runs on push to `main`
- Builds with `npm run build`
- Deploys to Firebase Hosting
- Add Firebase token as `FIREBASE_TOKEN` secret

---

## Troubleshooting

**Build fails with browserslist warning:**
```bash
npm run build  # Automatically updates browserslist
```

**Tests not found:**
```bash
npm test -- --watchAll=false  # Default test location: src/_tests_/
```

**ESLint errors:**
```bash
npx eslint src/ --fix  # Auto-fix some issues
```
