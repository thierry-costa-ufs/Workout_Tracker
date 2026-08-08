# Development

## Prerequisites

- Node.js **22 (LTS)** — pin via `.nvmrc` (`nvm use`)
- npm
- Expo Go on device, or an Android/iOS emulator
- Releases: EAS CLI (`npm i -g eas-cli`) + `eas login`

## Setup

```bash
npm install
npx expo start
```

Local tooling: `opencode.json` and `AGENTS.md` are gitignored by design — recreate `opencode.json` on a fresh clone:

```json
{ "$schema": "https://opencode.ai/config.json", "instructions": [".opencode/personal/WORKFLOW.md"] }
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
| `npm run typecheck`    | `tsc --noEmit`                   |
| `npm test`             | Jest (preset `jest-expo`)        |
| `npx expo-doctor`      | Dependency/config sanity check   |

## Pre-commit pipeline

`.husky/pre-commit` runs `lint-staged`. Staged files pass through:

1. `eslint --fix`
2. `prettier --write`

Files are re-staged after fixes. Any lint failure blocks the commit.

## Verification

```bash
npm run lint
npm run typecheck
npm test
```

`tsconfig.json` extends `expo/tsconfig.base` with `strict: true` and `@/*` → `./src/*`. The full `tsc --noEmit` pass is green; keep it that way on every change. Jest config lives in `jest.config.js` (preset `jest-expo`, async-storage mock in `jest.setup.js`) with a coverage threshold of 30/25/25/30 (statements/branches/functions/lines) — run `npm test -- --coverage`.

## Release flow

```bash
eas update --channel production        # OTA for store users
eas build --platform android --profile production --auto-increment   # native release
```

`--auto-increment` bumps the version on EAS (matches `appVersionSource: remote`).

## Git workflow

- Branch: feature branches off `main`, e.g. `feat/<topic>` or `refactor/<topic>`
- Commits: Conventional Commits, subject ≤ 50 chars. Body only when "why" isn't obvious.
  - `feat:` new feature
  - `fix:` bug fix
  - `refactor:` code restructure, no behavior change
  - `style:` formatting, no logic change
  - `chore:` tooling, config, dependencies
  - `docs:` documentation
- Push and open a PR when a feature is complete
