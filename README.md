# 🏋️‍♂️ Workout Tracker Mobile

A React Native + Expo app for planning workouts, running training sessions, and tracking personal records in a minimal dark-mode interface.

## ✨ Current capabilities
- Build and save workout templates by day of the week
- Select an active routine for the current training flow
- Review and edit exercise sets directly from the planning screen
- Run a session view for the day’s planned exercises
- Track personal records for exercises and loads
- Use a dedicated timer screen for recovery and interval work

## 🧱 Project structure
- src/app: Expo Router entry and tab layout
- src/context: workout state and persistence with AsyncStorage
- src/features/workout-dashboard: home/dashboard experience
- src/features/workout-planning: routine planning flow
- src/features/workout-records: personal records management
- src/features/workout-session: session tracking UI
- src/features/workout-timer: interval/timer screen
- src/shared: shared UI and theme tokens

## 🛠️ Tech stack
- React Native
- Expo Router
- TypeScript
- AsyncStorage
- Expo Haptics
- React Native Safe Area Context

## ▶️ Running the app
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Expo:
   ```bash
   npx expo start
   ```
3. Open the app in Expo Go or an emulator.

## ✅ Verification
The project has been verified with:
- npm run lint
- npx tsc --noEmit

## 🔜 Possible next steps
- Refine the workout editing experience and validation
- Add richer session analytics and progress history
- Improve persistence reliability and data migration paths
- Expand the planning flow with more advanced templates and presets
