# Development

## Prerequisites

- Node.js **22 (LTS)** — pin via `.nvmrc` (`nvm use`)
- npm
- Expo Go on device, or an Android/iOS emulator
- Releases: EAS CLI (`npm i -g eas-cli`) + `eas login`

## Setup

```bash
npm ci
npx expo start
```

Local tooling: `opencode.json` and `AGENTS.md` are gitignored by design — recreate `opencode.json` on a fresh clone:

```json
{ "$schema": "https://opencode.ai/config.json", "instructions": ["docs/DEVELOPMENT.md"] }
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

## Verification (run after every change)

```bash
npm run typecheck && npm run lint && npm test && npx expo-doctor && npm run format:check
```

`tsconfig.json` extends `expo/tsconfig.base` with `strict: true` and `@/*` → `./src/*`. Full `tsc --noEmit` pass green; keep it that way. Jest config in `jest.config.js` (preset `jest-expo`, async-storage mock in `jest.setup.js`) with coverage threshold 30/25/25/30 (statements/branches/functions/lines) — run `npm test -- --coverage`.

## Git workflow

### Branching — Git Flow

```
main ← develop ← feat/*, fix/*, refactor/*, chore/*, docs/*
```

- `main`: production. Always deployable. No direct commits.
- `develop`: integration branch. All feature branches merge here first.
- Feature branches: `feat/<topic>`, `fix/<topic>`, `refactor/<topic>`, `chore/<topic>`, `docs/<topic>`. Short-lived ≤ 2 days.

### Commits

Conventional Commits, subject ≤ 50 chars. Body only when "why" isn't obvious.

- `feat:` new feature
- `fix:` bug fix
- `refactor:` code restructure, no behavior change
- `style:` formatting, no logic change
- `chore:` tooling, config, dependencies
- `docs:` documentation
- `test:` new or updated tests

Link PRs to issues: `Closes #N` in PR body.

### Pull requests

- PR title = Conventional Commit (`feat: add timer presets`).
- Squash-merge into `develop`. Merge commit into `main` (release PR).
- Delete branch after merge.

### Branch protection

**`main`:**

- PR required, no direct commits.
- 2 approvals for `scope: core` (storage, guards, data contexts).
- 1 approval for everything else.
- All CI checks must pass (typecheck, lint, test, coverage, format, expo-doctor).
- Dismiss stale reviews on new pushes.

**`develop`:**

- PR required, no direct commits.
- 1 approval minimum.
- All CI checks must pass.
- Dismiss stale reviews on new pushes.

### Review — strict rotation

Fixed sequence: **Thierry → Cauã → Derek → Lucas**.

- PR creator tags the designated reviewer.
- Reviewer follows strict rotation: after each PR, rotate to the next person in sequence.
- **SLA:** acknowledge ≤ 24h business days. If no response after 24h, any team member may pick up (documented exception in PR comment).
- For `scope: core` PRs (storage, guards, data contexts): **2 approvals required**.

### Review checklist

Reviewer checks:

1. Logic correctness and invariants
2. Storage/guard invariants for data-layer code
3. TypeScript strictness maintained (no `!` without prior length check)
4. No new locale-dependent serialization (ISO dates only)

Reviewer does NOT check:

- Formatting, import order, linting — CI owns style
- Naming convention disputes — follow existing patterns

Device smoke for UI PRs: `npm test` + manual verification on device/emulator.

## CI/CD

### CI gate

`.github/workflows/ci.yml` runs on every PR and push to `main`/`develop`. Required checks before merge:

1. `npx tsc --noEmit` (full pass, not just touched files)
2. `npx expo lint`
3. `npm test -- --ci --coverage` (threshold enforced)
4. `npm run format:check`
5. `npx expo-doctor`

Merge blocked on any red.

### Pre-commit

`.husky/pre-commit` runs `lint-staged`. Staged files pass through:

1. `eslint --fix`
2. `prettier --write`

Files are re-staged after fixes. Any lint failure blocks the commit.

### Pre-push

`.husky/pre-push` runs `npx tsc --noEmit` + `npm test -- --ci`. Quick local safety net.

### Deploy

- **Preview:** manual via `eas update --channel preview`
- **Production:** manual via `eas build --profile production --auto-increment`

No auto-deploy. EAS owns versioning (`appVersionSource: remote`). Never hand-bump `version` in `app.json`.

## Testing

- Jest with `jest-expo` preset.
- Coverage threshold: 30/25/25/30 (statements/branches/functions/lines).
- New pure logic → sibling `.test.ts`.
- Screens are low-value — exclude from coverage target.
- Coverage gate enforced in CI.

## Releases & SemVer

- EAS owns `version` remotely (`appVersionSource: remote`).
- `--auto-increment` bumps on each prod build.
- After each production build: `git tag v<version>` on `main`.
- Changelog: append entry to `CHANGELOG.md` with date, version, and summary from squash commits.

```bash
eas build --platform android --profile production --auto-increment
git tag v<version>   # read version from EAS dashboard
```

## Issue templates

- Bug reports: `.github/ISSUE_TEMPLATE/bug_report.md`
- Feature requests: `.github/ISSUE_TEMPLATE/feature_request.md`

## PR template

`.github/PULL_REQUEST_TEMPLATE.md` — fill in before requesting review.

## Definition of Done

- [ ] All 5 CI checks green (typecheck, lint, test, coverage, format, expo-doctor)
- [ ] Device smoke verified (UI changes)
- [ ] Reviewer approved (1 approval; 2 for `scope: core`)
- [ ] Issue linked (`Closes #N`)
- [ ] Branch deleted after merge
- [ ] Docs updated if behavior or workflow changed
- [ ] Changelog entry if user-facing change
