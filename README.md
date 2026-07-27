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
- Shared UI components (filter chips, search bar, exercise picker, PR badge)

## Project Structure

```
src/
  app/              Expo Router entry, tab layout, record screen
  context/          Workout state and persistence (AsyncStorage)
  core/
    constants/      Day definitions, muscle groups, exercise data
    storage/        AsyncStorage helpers
    ui/             AppScreen shell with safe area + tab bar padding
  features/
    workout-dashboard/     Home/dashboard experience
    workout-planning/      Routine planning flow
    workout-records/       Personal records management
    workout-session/       Session tracking UI
    workout-timer/         Interval/timer screen
  shared/
    constants/      Theme tokens (colors, spacing)
    context/        TabNavigationContext, PortalContext
    hooks/          useActiveTemplate, useSidebarDrawer
    styles/         Shared screen, filter chip, PR badge styles
    ui/             MuscleFilterChips, SearchBar, ExercisePickerModal,
                    SidebarDrawer, Overlay, Portal, PrBadge
    utils/          confirmDelete helper
  types/            TypeScript interfaces (workout.ts)
```

## Tech Stack

**Core:** React Native 0.81, Expo 54, TypeScript 5.9, React 19.1

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

## Development

```bash
npm run lint        # expo lint
npm run format      # prettier --write .
```

**Commit format:** Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.), subject ≤ 50 chars.

**Branch strategy:** Feature branches off `main`, conventional commit messages.
