# Development

## Prerequisites

- Node.js (npm)
- Expo Go on device, or an Android/iOS emulator

## Setup

```bash
npm install
npx expo start
```

Clear Metro cache if bundles look stale:

```bash
npx expo start -c
```

## Scripts

| Command                | What it does                     |
| ---------------------- | -------------------------------- |
| `npm run start`        | `expo start`                     |
| `npm run android`      | Start + open on Android emulator |
| `npm run ios`          | Start + open on iOS simulator    |
| `npm run web`          | Start web build                  |
| `npm run lint`         | `expo lint` (ESLint flat config) |
| `npm run format`       | `prettier --write .`             |
| `npm run format:check` | Prettier check only              |

## Pre-commit pipeline

`.husky/pre-commit` runs `lint-staged`. Staged files pass through:

1. `eslint --fix`
2. `prettier --write`

Files are re-staged after fixes. Any lint failure blocks the commit.

## Verification

```bash
npm run lint
npx tsc --noEmit
```

`tsconfig.json` extends `expo/tsconfig.base` with `strict: true` and `@/*` → `./src/*`. Note: `npx tsc --noEmit` currently reports a few pre-existing errors in unrelated files — do not treat the full pass as green; at minimum the files you touched must be clean.

## Git workflow

- Branch: feature branches off `main`, e.g. `feat/<topic>` or `refactor/<topic>`
- Commits: Conventional Commits, subject ≤ 50 chars (`feat:`, `fix:`, `refactor:`, `chore:`)
- Push and open a PR when a feature is complete
