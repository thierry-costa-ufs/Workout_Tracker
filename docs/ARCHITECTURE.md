# Architecture

## Overview

Expo Router app (React Native 0.81, Expo 54, TypeScript strict). Entry point is `expo-router/entry` (`"main"` in `package.json`). All source lives under `src/`, aliased as `@/` in `tsconfig.json`.

## App entry and provider chain

`src/app/_layout.tsx` composes, outermost first:

1. `GestureHandlerRootView` — required by react-native-gesture-handler
2. `ModalPortalProvider` — modal stacking above tab bar (`src/shared/context/PortalContext.tsx`)
3. `WorkoutProvider` — all workout state (`src/context/WorkoutContext.tsx`)
4. `ErrorBoundary` — root error handling (`src/shared/ui/ErrorBoundary.tsx`)
5. `Stack` — two screens: `(tabs)` group and `record`

## Routes

```
src/app/
  _layout.tsx         Root stack + providers
  record.tsx          Personal records screen
  (tabs)/
    _layout.tsx       Tab view layout
    index.tsx         Dashboard
    session.tsx       Session tracking
    timer.tsx         Recovery/interval timer
    planning.tsx      Routine planning
```

Tab order and switching are driven by `TabNavigationContext` (`src/shared/context/TabNavigationContext.tsx`); the dashboard header and `SidebarDrawer` call `switchTab(idx)`.

## Layers

| Layer    | Path                   | Responsibility                                                                                 |
| -------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| App      | `src/app/`             | Router entry, route screens                                                                    |
| Context  | `src/context/`         | `WorkoutContext.tsx` — global workout state + persistence                                      |
| Core     | `src/core/`            | Constants (`days.ts`, `exercises.ts`), storage (`workoutStorage.ts`), `ui/AppScreen.tsx` shell |
| Features | `src/features/*/`      | One folder per domain, self-contained                                                          |
| Shared   | `src/shared/`          | Theme, contexts, hooks, styles, UI kit, utils — reused across features                         |
| Types    | `src/types/workout.ts` | Domain TypeScript interfaces                                                                   |

## State and persistence

`WorkoutContext.tsx` exports three sibling contexts: **sessions**, **templates**, and **personal records**. It hydrates from AsyncStorage on mount (`isLoading` flag) and persists on write.

- Persistence layer: `src/core/storage/workoutStorage.ts` (wraps AsyncStorage, keyed per domain)
- Per-day workout template data: `BlockStructure`, serialized via `src/features/workout-planning/utils/blockSerializer.ts`
- Session progress is persisted independently by `useSessionEngine` under keys like `@gym_app:session_progress:<templateId>`

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

Planning screen saves templates → `WorkoutProvider.saveTemplate` persists → `useActiveTemplate` (`src/shared/hooks/useActiveTemplate.ts`) exposes active template → session screen feeds its exercises into `useSessionEngine` → telemetry renders completed/total/percentage.
