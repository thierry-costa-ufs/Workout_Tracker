# assets

ponytail: placeholder identity — solid `#121212` background + `P` mark in `#E5E5EA`, generated
from `src/shared/constants/theme.ts` colors so builds stop shipping the default Expo icon.
Swap every file here for real brand assets when they land; `app.json` paths stay the same.

| File                | Size      | Alpha | Used by                                                               |
| ------------------- | --------- | ----- | --------------------------------------------------------------------- |
| `icon.png`          | 1024×1024 | no    | `expo.icon` (App Store rejects alpha)                                 |
| `adaptive-icon.png` | 1024×1024 | yes   | `android.adaptiveIcon.foregroundImage`, mark inside the 66% safe zone |
| `splash-icon.png`   | 200×200   | yes   | `expo-splash-screen` plugin                                           |
| `splash.png`        | 1242×2436 | no    | `expo.splash.image` (iOS)                                             |
| `favicon.png`       | 48×48     | no    | `web.favicon`                                                         |
