# Code Style

## Tooling

Enforced by ESLint + Prettier. `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "bracketSpacing": true,
  "arrowParens": "always",
  "printWidth": 100
}
```

`eslint.config.js`: `eslint-config-expo` flat config + `eslint-config-prettier` (style rules off in favor of Prettier). Ignored: `dist/`, `web-build/`, `android/`, `ios/`. `.prettierignore` mirrors build output folders.

## TypeScript

- `strict: true`, `noFallthroughCasesInSwitch: true`
- Import alias `@/*` maps to `src/` — always use it, never relative imports
- Domain shapes live in `src/types/workout.ts`, not inline

## Naming conventions

| Thing                | Convention             | Example                                    |
| -------------------- | ---------------------- | ------------------------------------------ |
| Component files      | PascalCase             | `SidebarDrawer.tsx`, `AppScreen.tsx`       |
| Non-component files  | kebab-case             | `dashboardStyles.ts`, `blockSerializer.ts` |
| Components/functions | PascalCase / camelCase | `TelemetryDisplay`, `handleItemPress`      |
| Hooks                | `use` prefix           | `useSessionEngine`, `useActiveTemplate`    |
| Module constants     | `UPPER_SNAKE`          | `MENU_ITEMS`, `SIDEBAR_WIDTH`              |
| Feature folders      | kebab-case             | `workout-dashboard`                        |
| Types/interfaces     | PascalCase             | `WorkoutSession`, `SessionProgress`        |

## Structure and imports

- Feature code goes in its own folder under `src/features/<feature>/`; cross-cutting code in `src/shared/`
- Styles colocated per feature under `<feature>/styles/` (e.g. `sessionStyles.ts`), shared styles in `src/shared/styles/`
- Imports: external packages first, then `@/` paths, relative within-feature last
- Only the files actually used are imported; prune dead styles and unused imports

## UI conventions

- `StyleSheet.create` at bottom of the file (exported as `styles`), not inline objects for repeated values
- Colors/spacing from `src/shared/constants/theme.ts` (`appTheme.colors.*`) — no hardcoded hex
- `AppScreen` is the standard screen shell (safe area + tab bar padding)
- Prefer `Pressable` with `hitSlop` over bare `Touchable*` where interaction needs stability
- Semantic emphasis via fontWeight/textCase (uppercase labels), consistent with existing screens

## React patterns

- Memoize handlers passed to children with `useCallback` (`useSessionEngine`, sidebar handlers)
- Heavy pure components wrapped in `React.memo` (`TelemetryDisplay`)
- Animated values via react-native-reanimated shared values, not re-render state, inside gesture paths
