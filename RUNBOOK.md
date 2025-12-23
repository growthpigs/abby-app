# ABBY - RUNBOOK

> **Client:** Manuel Negreiro
> **Project:** ABBY (The Anti-Dating App)
> **Created:** 2025-12-19

---

## Google Drive Folders

| Folder | ID |
|--------|-----|
| Root (ABBY) | `1xKaC62ap5_gN2ZJo0MMiSfIin933Y-TH` |
| Client Intake | `1cm5pNEaLcDXRjAnaMzgmW7wubojT9CzM` |
| 00-OVERVIEW | `1Nm4gz5AQ30eayxRjMSWoM_lDIUiu47yU` |
| 01-INTAKE | `1Ss3z6NZy6QeMHa-KhmCr-XX8A_8ltF1v` |
| 02-PROPOSALS | `1FYd8FFOMMsXBRvxbwNyKQnyb8yQlX8Ez` |
| 03-SPECS | `1BUECvMqtlCBT9NfBg5pBPTWe3dSoW7pg` |
| 04-WORK | `1e9V8Seo1T7Lk7ZAXKDFMtnc2XojN8AOa` |
| 05-REPORTS | `1nHX_xjtcq7y2jBprgavmIIEyevG4dHAd` |
| 06-DELIVERED | `1JnB6HCp0rswJeSYBN12M3hBi9Vk-VCg6` |
| _INTERNAL | `1BPbvl0RENoQyvVldx8QU33E0AJ4M6cW4` |

---

## Environments

| Environment | URL | Notes |
|-------------|-----|-------|
| Development | Local Expo | `npm start` |
| Preview | TestFlight | EAS Build |
| Production | App Store | TBD |

---

## Deploy Commands

```bash
# Local development
npx expo start --ios          # Start with iOS Simulator
npx expo install              # Install dependencies
npx expo prebuild --platform ios  # Generate native code

# Staging/Production builds
npx eas build --platform ios --profile preview  # TestFlight build
npx eas submit --platform ios                   # App Store Connect
```

---

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| EXPO_PUBLIC_API_BASE_URL | Backend API base URL | https://api.abby.app |
| EXPO_PUBLIC_ENVIRONMENT | Environment identifier | development/staging/production |
| ELEVENLABS_API_KEY | Voice service key | sk_xxx... (backend only) |
| ELEVENLABS_AGENT_ID | Pre-built agent ID | agent_xxx... (backend only) |
| SENTRY_DSN | Error tracking | https://xxx@sentry.io/xxx |

**Security Notes:**
- Only `EXPO_PUBLIC_*` variables available in client
- Sensitive keys (ElevenLabs) stored in Nathan's secure backend
- Use Expo SecureStore for local token storage

---

## Performance Targets

| Metric | Target |
|--------|--------|
| App Launch | < 3 seconds |
| Frame Rate | 60fps sustained |
| Voice Latency | < 500ms response start |
| Memory Usage | < 200MB normal operation |
| Battery Impact | < 10%/10min active use |

---

## Third-Party Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| ElevenLabs | Real-time voice conversation | Pending credentials |
| Sentry | Error tracking | To configure |
| AWS S3 (Nathan) | Voice file storage | Nathan manages |

---

## Key Contacts

| Role | Name | Responsibility |
|------|------|----------------|
| Client / Decision Maker | Manuel Negreiro | Approvals, direction |
| Client Contact | Brent | Communication |
| Frontend + Integration | Diiiploy | App development |
| Backend / AWS | Nathan | Heavy infrastructure, APIs, S3 |

---

## Deal

| Item | Value |
|------|-------|
| Roderic's scope | $5,000 |
| DIIIPLOY scope | Go-to-market (separate deal) |

---

## Troubleshooting

### "App entry not found" or Metro bundler fails

**Symptoms:**
- Metro shows "Unable to resolve entry file"
- App crashes on startup with no clear error
- `npm ls` shows packages marked as `invalid`

**Diagnosis:**
```bash
# Check for invalid peer dependencies
npm ls 2>&1 | grep -i invalid

# Check Expo version alignment
npm ls expo | head -10
```

**Common causes:**

1. **Expo plugin version mismatch** (EP-046)
   - `@config-plugins/react-native-webrtc` must match Expo SDK version
   - v10.0.0 for Expo 52, v13.0.0 for Expo 54

2. **LiveKit/ElevenLabs SDK version conflict**
   - Must keep all related packages in sync
   - See version mapping table below

**Fix:**
```bash
# Clean install with correct versions
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### "event-target-shim/index" warnings flooding console (EP-045)

**Symptoms:**
```
WARN  Attempted to import the module "node_modules/event-target-shim/index"
which is not listed in the "exports"
```

**Cause:** LiveKit imports `event-target-shim/index` but v6.0.2's exports field doesn't expose that subpath.

**Fix:** Add `metro.config.js` with custom resolver (already in repo).

### Version Compatibility Matrix (Dec 2025)

| Package | Expo 52 | Expo 54 |
|---------|---------|---------|
| @config-plugins/react-native-webrtc | v10.0.0 | **v13.0.0** |
| @elevenlabs/react-native | v0.2.1 | **v0.5.7** |
| @livekit/react-native-webrtc | v125.x | **v137.x** |
| @livekit/react-native | v2.7.x | **v2.9.x** |
| livekit-client | v2.9.x | **v2.15.x** |
| event-target-shim | v5.0.1 | **v6.0.2** |

---

## Notes

- iOS only for v1.0
- Backend mocked locally
- TestFlight for client demos
