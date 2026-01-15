# ABBY - The Anti-Dating App

> iOS React Native app for AI-powered matchmaking with living shader backgrounds

## Quick Start

```bash
# 1. Clone and install
git clone git@github.com:growthpigs/abby-app.git
cd abby-app
npm install

# 2. Build and run on iOS (requires Xcode + iOS Simulator)
npx expo run:ios

# 3. Run tests
npm test
```

**⚠️ Important:** This app requires a **dev build** (NOT Expo Go) because of native Skia shaders.

### First Time Setup

1. Open Xcode at least once to accept license
2. Ensure iOS Simulator is installed (`xcode-select --install`)
3. Run `npx expo run:ios` - first build takes 5-10 minutes

## Requirements

- Node.js 18+
- Xcode 15+ (for iOS simulator)
- iOS Simulator or physical device

## Environment

Environment files are included and pre-configured:

| File | Purpose |
|------|---------|
| `.env.development` | Local development |
| `.env.production` | Production builds |

Key settings:
- `EXPO_PUBLIC_VOICE_ENABLED=false` - **Must be false for keyboard to work in simulator**
- `EXPO_PUBLIC_API_BASE_URL=https://dev.api.myaimatchmaker.ai`

## Project Structure

```
src/
├── components/
│   ├── layers/          # Visual layers (shaders, orb, glass)
│   ├── screens/         # App screens
│   └── ui/              # Reusable UI components
├── services/            # API, auth, voice services
├── shaders/             # GLSL shader code
├── store/               # Zustand state stores
└── constants/           # Colors, typography, layout
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npx expo run:ios` | Build and run on iOS |
| `npm test` | Run test suite (485 tests) |

## Architecture

See `CLAUDE.md` for detailed architecture documentation.

## Backend API

- **Base URL:** `https://dev.api.myaimatchmaker.ai`
- **API Docs:** https://dev.api.myaimatchmaker.ai/docs#/
- **Auth:** AWS Cognito (credentials in `.env` files)

## Known Issues

- `EXPO_PUBLIC_VOICE_ENABLED=true` blocks keyboard input in iOS simulator
- See `docs/TECH-DEBT.md` for tracked technical debt

## Handover

See `HANDOVER.md` for developer onboarding and WebRTC integration requirements.
