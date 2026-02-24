# ADR-003: Hardening Pipeline

## Status

Accepted

## Date

2026-02-24

## Context

We need to ensure code quality, security, and documentation completeness before deploying to production. The current pipeline lacks automated checks for mutation testing (code coverage quality) and documentation review.

## Decision

We will extend the `harden` script to include:

1. **Mutation Testing** - A lightweight mutation testing approach that makes small code changes (operator mutations) and verifies tests catch them. This ensures tests are actually validating code behavior, not just passing.

2. **Documentation Review** - Automated checks that verify:
   - Required documentation files exist (README.md, AGENTS.md, docs/)
   - Documentation is updated with every push (checks git history)

## Consequences

### Positive
- Higher confidence in test quality via mutation testing
- Documentation is kept up-to-date
- Single command for all pre-deploy checks

### Negative
- Hardening takes longer to run
- Mutation testing may produce false positives in some cases

## Implementation

The `harden` script now includes:
- `runMutationTest()` - Applies small mutations to source files and verifies tests fail
- `runDocReview()` - Checks for required docs and staleness

## Commands

```bash
npm run harden  # Run all hardening checks
```

## References

- [Stryker Mutator](https://stryker-mutator.io/) - Industry standard for mutation testing
