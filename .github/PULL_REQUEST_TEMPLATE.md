## Type of Change

Select applicable options:

- [ ] `feat:` New feature
- [ ] `fix:` Bug fix
- [ ] `refactor:` Code restructuring
- [ ] `style:` Visual / StyleSheet adjustments
- [ ] `chore:` Config / Tooling / Dependencies
- [ ] `docs:` Documentation

## Related Issue

Link the resolved issue using keywords (e.g., `Closes #12` or `Fixes #45`):

> **Issue:**

## Affected Architecture Layers

Select modified layers:

- [ ] `src/app/` (Expo Router / Routes)
- [ ] `src/context/` (Global State / Providers)
- [ ] `src/core/` (Storage, AppScreen, Constants)
- [ ] `src/features/` (Domain Modules)
- [ ] `src/shared/` (UI Kit, Hooks, Themes, Utils)
- [ ] `src/types/` (TypeScript Interfaces)

## Description

Summarize technical changes and implementation details.

## Local Verification Checklist

Confirm all local checks pass before requesting review:

- [ ] **Lint:** `npm run lint` passes without ESLint errors.
- [ ] **Typecheck:** `npm run typecheck` (`tsc --noEmit`) passes cleanly.
- [ ] **Tests:** `npm test` passes all Jest unit tests.
- [ ] **Commits:** Follow Conventional Commits (subject ≤ 50 chars).
- [ ] **Tested:** Verified functionality on Expo Go or emulator.

## Screenshots / Screen Recording (Optional)

Attach an image or GIF demonstrating visual or UI changes.

## Code Review Rotation

- **Reviewer:** @username
