# Workout Tracker Mobile

React Native + Expo app for planning workouts, running training sessions, and tracking personal records. Dark-mode interface with haptic feedback.

## Features

- Build and save workout templates by day of week
- Select active routine for current training flow
- Review and edit exercise sets from planning screen
- Run session view for day's planned exercises
- Track personal records for exercises and loads
- Dedicated timer screen for recovery and interval work
- Swipe between tabs with animated tab view
- Hamburger menu + sidebar drawer on home screen
- Portal-based modals stacking above tab bar

## Tech Stack

**Core:** React Native 0.81, Expo 54, TypeScript 5.9 (strict), React 19.1

**Navigation:** Expo Router 6, React Navigation 7, react-native-tab-view 4, react-native-pager-view

**UI:** react-native-reanimated 4, react-native-gesture-handler, expo-linear-gradient, expo-haptics, react-native-svg, @expo/vector-icons

**Storage:** @react-native-async-storage/async-storage

**Dev:** ESLint 9, Prettier, Husky, lint-staged

## Getting Started

```bash
npm install
npx expo start
```

Open in Expo Go or emulator.

## Docs

- [ARCHITECTURE](docs/ARCHITECTURE.md) — entry/provider chain, routes, layers, state, data flow
- [DEVELOPMENT](docs/DEVELOPMENT.md) — setup, scripts, pre-commit pipeline, verification, git workflow
- [CODE_STYLE](docs/CODE_STYLE.md) — Prettier/ESLint config, TS conventions, naming, UI patterns

## Development

```bash
npm run lint        # expo lint
npm run format      # prettier --write .
```

Commits follow Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.), subject ≤ 50 chars.
