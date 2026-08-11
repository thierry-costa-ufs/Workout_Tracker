# Changelog

All notable changes to this project will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-08-10

### Added

- Workout template planning with day-of-week organization
- Session view with exercise tracking and set logging
- Personal records tracking per exercise
- Recovery timer with local notifications
- Dark mode interface with haptic feedback
- Animated tab view navigation
- Sidebar drawer with quick access
- Portal-based modal stacking

### Technical

- Expo SDK 54, React Native 0.81, TypeScript 5.9 strict
- AsyncStorage persistence with versioned keys, shadow-then-swap writes, corrupt→shadow self-heal
- Guard hardening with limits validation at read boundary
- CI pipeline: typecheck, lint, test, coverage, format, expo-doctor
- EAS Update for OTA JS fixes
- Jest with 30/25/25/30 coverage threshold
