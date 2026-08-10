# Architecture

## Overview

Expo Router app (React Native 0.81, Expo 54, TypeScript strict). Entry point is `expo-router/entry` (`"main"` in `package.json`). All source lives under `src/`, aliased as `@/` in `tsconfig.json`.

## App entry and provider chain

`src/app/_layout.tsx` composes, outermost first:

1. `GestureHandlerRootView` — required by react-native-gesture-handler
2. `ModalPortalProvider` — modal stacking above tab bar (`src/shared/context/PortalContext.tsx`)
3. `TemplatesProvider` — template CRUD + active template (`src/context/TemplatesContext.tsx`)
4. `PersonalRecordsProvider` — PR CRUD + queries (`src/context/PersonalRecordsContext.tsx`)
5. `ErrorBoundary` — root error handling (`src/shared/ui/ErrorBoundary.tsx`)
6. `Stack` — two screens: `(tabs)` group and `record`

## Routes

```
src/app/
  _layout.tsx         Root stack + providers
  record.tsx          Personal records screen
  (tabs)/
    _layout.tsx       TabView layout (Dashboard, Session, Timer, Planning screens)
```

All four tab screens are rendered by a single `TabView` in `(tabs)/_layout.tsx` — there are no separate route files per tab. Tab order and switching are driven by `TabNavigationContext` (`src/shared/context/TabNavigationContext.tsx`); the dashboard header and `SidebarDrawer` call `switchTab(idx)`.

## Layers

| Layer    | Path                   | Responsibility                                                                                 |
| -------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| App      | `src/app/`             | Router entry, route screens                                                                    |
| Context  | `src/context/`         | `TemplatesContext.tsx`, `PersonalRecordsContext.tsx` — global state + persistence              |
| Core     | `src/core/`            | Constants (`days.ts`, `exercises.ts`), storage (`workoutStorage.ts`), `ui/AppScreen.tsx` shell |
| Features | `src/features/*/`      | One folder per domain, self-contained                                                          |
| Shared   | `src/shared/`          | Theme, contexts, hooks, styles, UI kit, utils — reused across features                         |
| Types    | `src/types/workout.ts` | Domain TypeScript interfaces                                                                   |

## State and persistence

Two contexts hydrate from AsyncStorage on mount and persist on write: `TemplatesContext` (template CRUD + active template) and `PersonalRecordsContext` (PR CRUD + queries). Session progress lives in `useSessionEngine` (`src/features/workout-session/hooks/useSessionEngine.ts`), which persists independently via the storage layer.

- Persistence layer: `src/core/storage/workoutStorage.ts` — the single sanctioned AsyncStorage seam. All reads/writes flow through it; hooks and components never touch AsyncStorage directly.
- Versioned keys `@gym_app:v<N>:*` (bumped via `STORAGE_VERSION`). Legacy unversioned keys migrate once on first load via `migrateStorage()` (memoized, idempotent).
- Writes are atomic: shadow key (`@gym_app:bak:v<N>:*`) written first as last-known-good, then canonical. A per-key serialized queue guarantees concurrent saves land in order (last write wins, no stale-overwrite).
- Reads use a throwing JSON parser: empty ≠ corrupt. Corrupt canonical falls back to shadow and self-heals by rewriting canonical. Corrupt with no shadow returns `[]`.
- Per-day workout template data: `BlockStructure`, serialized via `src/features/workout-planning/utils/blockSerializer.ts`
- Session progress is persisted independently by `useSessionEngine` under keys like `@gym_app:v<N>:session:<templateId>:<date>`

## Feature folder convention

Each feature under `src/features/` owns its domain. Typical layout:

```
workout-session/
  screens/        Route screens
  views/          Large non-route screens embedded in screens
  components/     Feature-local components
  hooks/          Logic hooks (e.g. useSessionEngine)
  styles/         Colocated StyleSheet files
  utils/          Pure helpers
```

## Navigation and overlays

- Tabs: react-native-tab-view + pager (`src/app/(tabs)/_layout.tsx`)
- Stack pushes: `record` screen (`src/app/record.tsx`)
- Modals/overlays: `Portal` (`src/shared/ui/Portal.tsx`) renders into `PortalContext`; used by `Overlay`, `SidebarDrawer`, `ExercisePickerModal`
- Sidebar: `SidebarDrawer` (`src/shared/ui/SidebarDrawer.tsx`) — slides from the right, backdrop closes it, hardware back closes it

## Data flow example

Planning screen saves templates → `TemplatesProvider.saveTemplate` persists → `useActiveTemplate` (`src/shared/hooks/useActiveTemplate.ts`) exposes active template → session screen feeds its exercises into `useSessionEngine` → telemetry renders completed/total/percentage.
