# 01 — Project Architecture

All findings **Confirmed from code** unless tagged otherwise. Repo root: `/Users/tony/dialuna`. Audit date: 2026-07-14, branch `feature/prototype-fidelity-motion`.

## 1.1 Project Overview

- **What it is**: Dialuna, a menstrual-cycle / hormone-wellness tracking mobile app with a "lunar wellness" visual identity (warm gold/amber palette, soft translucent surfaces, ambient glow motion).
- **Primary audience**: Individuals tracking their menstrual cycle who want cycle predictions, a daily "hormone twin" wellness snapshot, symptom logging, and light AI-assisted guidance. **Inferred from code** (onboarding collects goals like `ONBOARDING_GOALS`, symptom history, cycle basics — no explicit "who this is for" copy was audited directly).
- **Core value proposition**: Local, private, on-device cycle prediction + a synthetic "hormone twin" wellness score + AI-coach-style guidance, wrapped in premium editorial visual design. **Inferred from code**.
- **Problem it solves**: Cycle/phase awareness and symptom-pattern insight without requiring an account or backend. **Inferred from code** — there is no login, no server, no account system; everything is local-first (see §"Notable architecture facts" below).
- **Business model**: Freemium — free cycle prediction, logging, and 3 AI questions/day; paid "premium" unlocks Insights detail cards, the Home "Plan" tips card, and unlimited AI questions. **Confirmed from code** — see `docs/app-audit/11-monetization-analytics-notification.md`. **Important**: the purchase flow itself is fully mocked (no IAP SDK); `src/i18n/en.json:448` literally contains the string `"mockNote": "Purchases are mocked in this build."`, confirming this is intentional/known, not an oversight.
- **Main features**: Cycle tracking & prediction, Hormone Twin daily wellness snapshot, Insights/analytics, AI Coach chat, daily symptom logging, Calendar, Settings, Onboarding, Paywall.
- **Likely premium/monetized features**: Insights detail cards (energy-by-phase, sleep, PMS window, top symptoms), Home "Plan" tips card, unlimited AI Coach questions. See `03-business-rules.md` §4 and `11-monetization-analytics-notification.md`.

## 1.2 Technology Map

| Group | Library/Tech | Version | Role | Config/usage location |
|---|---|---|---|---|
| Framework | Expo | `~57.0.2` | Managed workflow (no custom `ios/`/`android/` source of truth — those folders exist as generated build output) | `app.json`, `package.json` |
| Runtime | React Native | `0.86.0` | Native runtime | `package.json` |
| UI library | React | `19.2.3` | Component model | `package.json` |
| Language | TypeScript | `~6.0.3`, `strict: true` | Static typing | `tsconfig.json` (extends `expo/tsconfig.base`), path alias `@/*` → `src/*`, `@/assets/*` → `assets/*` |
| Package manager | npm | — | Dependency management | `package-lock.json` present (confirms npm, not yarn/pnpm) |
| Routing | Expo Router | `~57.0.3` | File-based navigation, typed routes (`experiments.typedRoutes: true` in `app.json`) | `src/app/**`, root `Stack` in `src/app/_layout.tsx` |
| State | Zustand | `^5.0.14` | Global app state, 5 stores (4 persisted, 1 in-memory) | `src/store/**` |
| Data fetching | **None** | — | No backend/API client exists — no axios, no fetch wrapper, no react-query/SWR | Confirmed absent by full-repo grep (see `09-state-data-api.md`) |
| Persistence | AsyncStorage | `2.2.0` (`@react-native-async-storage/async-storage`) | Backing store for Zustand `persist` middleware | `src/store/useUserStore.ts`, `useLogStore.ts`, `usePremiumStore.ts`, `useSettingsStore.ts` |
| Animation | react-native-reanimated | `4.5.0` | All UI-thread animation (springs, timings, entering/exiting) | `src/theme/motion.ts` + 19 consuming files, see `08-motion-interaction-audit.md` |
| Gesture | react-native-gesture-handler | `~2.32.0` | Installed as a peer dep of Expo Router / navigation; **no direct usage found in `src/`** | Transitive only — confirmed by grep |
| Haptics | expo-haptics | `~57.0.0` | Tactile feedback on press/select/success | 9 files, layered on top of `Pressable` |
| Graphics | react-native-svg | `15.15.4` | Luna mascot, icons, score/progress visuals | `src/components/mascot/Luna.tsx`, `ScoreRing.tsx`, etc. |
| Blur/glass | expo-blur, expo-glass-effect | `~57.0.0` each | Native blur (Android/older iOS) / Liquid Glass (capable iOS) | `src/components/ui/GlassSurface.tsx` |
| Gradients | expo-linear-gradient | `~57.0.0` | Background gradients, `BlobGlow`, chip fills | Used across theme-driven components |
| Images | expo-image | `~57.0.0` | Installed but **unused** — app has zero `<Image>` usage anywhere in `src/` | See `13-technical-debt.md` |
| Fonts | @expo-google-fonts/cormorant-garamond, @expo-google-fonts/manrope | `^0.4.x` | The app's two type families | Loaded via `useFonts()` in `src/app/_layout.tsx:56-62` |
| Form/validation | react-hook-form, @hookform/resolvers | `^7.80.0`/`^5.4.0` | Installed but **unused** — no `useForm`/`Controller`/`zodResolver` usage anywhere | See `13-technical-debt.md` |
| Validation | zod | `^4.4.3` | Actual validation mechanism (nickname/email/cycle-length/period-length schemas) | `src/utils/validation.ts` |
| Dates | date-fns | `^4.4.0` | Date arithmetic and formatting | `src/utils/date.ts` + feature screens; **no `date-fns/locale` import anywhere**, so Vietnamese-mode users still see English month/weekday names (see `10-assets-content-localization.md`) |
| Localization | i18next, react-i18next, expo-localization | `^26.3.4`/`^17.0.8`/`~57.0.0` | `en`/`vi` bundles, device-language detection, persisted override | `src/i18n/index.ts`, `en.json`, `vi.json` |
| Analytics | **None** | — | Confirmed absent by grep (no Sentry/Amplitude/Mixpanel/PostHog) | See `11-monetization-analytics-notification.md` |
| Crash reporting | **None** | — | Confirmed absent | Same |
| Push notification | **None** | — | No `expo-notifications` package installed; three notification *toggles* exist in Settings but are UI-only (see `04-user-flows.md`) | Same |
| Authentication | **None** | — | No auth SDK, no login screen; app is fully local/anonymous. Onboarding "Sign in with Apple" button is a disabled `Alert.alert` stub (`src/app/onboarding/account.tsx:102-106`) | See `04-user-flows.md` |
| Subscription/payment | **None (mocked)** | — | No RevenueCat/react-native-iap/Stripe; `usePremiumStore.purchase()` is a local state mutation | `src/store/usePremiumStore.ts:42` |
| Feature flags | **None** | — | Confirmed absent | — |
| Deep linking | Expo Router default | — | `app.json` sets `"scheme": "dialuna"`; no custom `Linking` handling found | `app.json:9` |
| Native modules | None custom | — | `ios/` and `android/` are Expo-generated build output, not hand-maintained native code | Per project CLAUDE.md, generated/ignored |
| Build config | Expo config (`app.json`) | — | Source of truth for native config | `app.json` |
| Env variables | **None found** | — | No `.env`/`app.config.js`/`expo-constants` extra config referencing secrets was located in this pass | **Unclear / requires confirmation** — not exhaustively audited |
| Testing | Vitest | `^4.1.9` | Unit tests for services/stores/theme | `src/**/*.test.ts`, 6 test files, 39 tests, all passing |
| Linting | ESLint (`eslint-config-expo`) | `^9.0.0` / `~57.0.0` | Flat config, extends `eslint-config-expo/flat` | `eslint.config.js` |
| CI/CD | **None found in repository** | — | No `.github/workflows`, no `bitrise.yml`, no `eas.json` found in this pass | **Unclear / requires confirmation** |

## 1.3 Folder Architecture

```
src/
├── app/            Expo Router route entries — thin, delegate to src/features
│   ├── (tabs)/      5 tab routes: home, log, calendar, insights, ai + tab _layout (custom FloatingDock)
│   ├── onboarding/  7-step onboarding stack + its own _layout
│   ├── _layout.tsx  Root Stack: index, onboarding, (tabs), settings, paywall + hydration/font/i18n gate
│   ├── index.tsx    Redirect-only: routes to /onboarding or /(tabs)/home based on hasOnboarded
│   ├── paywall.tsx  Modal route → PaywallScreen
│   └── settings.tsx Stack route → SettingsScreen
├── features/       Screen-level implementations, one subfolder per domain
│   ├── ai/, calendar/, cycle/, home/, insights/, log/, onboarding/, paywall/, settings/
├── components/     Reusable UI, split by concern
│   ├── ui/          Generic primitives (Button, Card, Chip, Screen, Pressable, GlassSurface, ...)
│   ├── cycle/       Cycle-domain visual components (CalendarDayCell, PhaseBadge, WeekStrip)
│   ├── mascot/      Luna SVG mascot
│   ├── paywall/     PremiumBanner
│   └── ai/          Chat-specific components (MessageBubble, SuggestedPrompts, TypingDots)
├── services/       Pure, tested domain "engines" — no React, no I/O
│   ├── cycleEngine.ts, hormoneTwinEngine.ts, insightsEngine.ts, aiCoachEngine.ts (+ .test.ts siblings)
├── store/          Zustand state — 4 persisted stores + shared index (resetAllData)
│   ├── useUserStore.ts, useLogStore.ts, usePremiumStore.ts, useSettingsStore.ts, index.ts
├── theme/          Design tokens
│   ├── palettes.ts, typography.ts, spacing.ts, radius.ts, shadows.ts, sizes.ts, motion.ts, useTheme.ts, index.ts (barrel)
├── types/          Shared TS types (user, log, cycle, premium, index barrel)
├── i18n/           i18next setup + en.json/vi.json resource bundles
└── utils/          date.ts, validation.ts (zod schemas)
```

**Layering / import rules (Inferred from code, no lint rule enforces this explicitly)**:
- `src/app/**` route files are thin — each is a handful of lines that renders a screen component from `src/features/**`. **Confirmed** for every route file read in the navigation audit.
- `src/features/**` screens compose `src/components/**` primitives and call `src/services/**` engines + `src/store/**` hooks directly. No intermediate "controller"/"presenter" layer.
- `src/services/**` are pure functions — no Zustand, no React, no I/O imports found in `cycleEngine.ts`/`hormoneTwinEngine.ts`/`insightsEngine.ts`/`aiCoachEngine.ts` (confirmed by the business-domain audit). This is a clean separation: engines take plain data in, return plain data out, and are independently unit-tested.
- `src/theme/**` has zero dependencies on `src/store`/`src/features` (one-directional: theme → consumed by everything else).
- Path alias `@/*` (→ `src/*`) is used consistently for imports; no relative `../../../` chains were flagged by any research agent.
- **No barrel-file public-API discipline for `src/features`** — feature folders export their screen component directly (e.g. `HomeScreen.tsx`), no `index.ts` re-export layer observed.
- **No native-specific code** (`.ios.tsx`/`.android.tsx` split files) exists anywhere in `src/` — confirmed by directory listing; all platform differences (if any) are handled via `Platform.select`/conditionals inside shared files (not exhaustively audited).

**Architecture is not mixed/inconsistent** — Confirmed from code: the domain-engine / Zustand-store / thin-route-file / reusable-component layering is applied consistently across all 91 TS/TSX files reviewed. The one soft violation worth noting: `src/features/*Screen.tsx` files (Home 499 lines, Settings 442 lines) are growing large enough to blur "screen composition" into "screen + a lot of inline logic" — see `13-technical-debt.md` §Large files.

## Files reviewed for this document
`package.json`, `app.json`, `tsconfig.json`, `eslint.config.js`, full `src/` directory listing (91 `.ts`/`.tsx` files, ~7,055 lines), `git log`.
