# 10 — Assets, Content & Localization

All findings **Confirmed from code** unless tagged otherwise.

## 1. Asset Inventory

`assets/dialuna/` contains exactly three files — no other asset directories exist anywhere in the repo:

| Asset | Type | Size | Used by | Status |
|---|---|---|---|---|
| `app-icon.png` | PNG | 840 KB | `app.json` → `expo.icon`, `expo.ios.icon`, `expo.android.adaptiveIcon.foregroundImage` | In use |
| `splash-screen.png` | PNG | 1.4 MB | `app.json` → `expo-splash-screen` plugin config | In use |
| `favicon.png` | PNG | 4 KB | `app.json` → `expo.web.favicon` | In use |

No Lottie, video, audio, Rive, or local font files exist anywhere outside `node_modules`. **No `<Image>` component usage exists anywhere in `src/**/*.tsx`** — all in-app visual identity (icons, mascot, glow effects) is produced with `react-native-svg`, `expo-linear-gradient`, and vector icon sets, not raster imagery. `expo-image` is an installed dependency with zero references in `src/` (see `13-technical-debt.md`).

**Status**: Clean. All 3 assets are used, none orphaned, no oversized/wrong-format/missing-density issues found; total footprint ~2.3 MB.

## 2. App Icon & Splash

- **iOS icon**: `expo.ios.icon` → `app-icon.png` (`app.json`).
- **Android adaptive icon**: `expo.android.adaptiveIcon.foregroundImage` → `app-icon.png`, `backgroundColor: '#F4E7DD'`.
- **Web favicon**: `expo.web.favicon` → `favicon.png`.
- **Splash**: `expo-splash-screen` plugin, `backgroundColor: '#FAF1EA'`, `image: splash-screen.png`, `imageWidth: 414`, `resizeMode: 'cover'`, `enableFullScreenImage_legacy: true`.
- **No separate light/dark icon or splash variants** were found configured in `app.json` — a single asset set serves both themes.
- **Native → app transition**: `src/app/_layout.tsx` calls `SplashScreen.preventAutoHideAsync()` at module scope and `SplashScreen.hideAsync()` once fonts/i18n/stores are all ready (see `04-user-flows.md` §1) — the native splash stays visible through the entire ready-gate, then hands off directly to the first rendered route with no additional in-app splash/loading screen.

## 3. Copywriting & Localization

### 3.1 Language support
i18next + react-i18next, static `en.json`/`vi.json` resource bundles, device language detected via `expo-localization` (`vi`→`vi`, everything else→`en`), user override persisted to AsyncStorage under `dialuna.lang` (outside the Zustand store system — not cleared by "Delete all data", see `09-state-data-api.md`). `fallbackLng: 'en'`. `AsyncStorage.getItem` failures during language detection are silently swallowed with a "best-effort" fallback to device language — acceptable, not flagged as debt.

### 3.2 Key-shape parity (en vs vi)
`en.json`: 316 leaf keys / 506 lines. `vi.json`: 312 leaf keys / 502 lines. The 4 keys present in `en` but absent from `vi` (`ai.remaining_one`, `common.days_one`, `home.periodIn_one`, `insights.symptomsCard.timesLogged_one`) are i18next **plural-form (`_one`) suffixes** — expected CLDR pluralization behavior for a non-pluralizing language like Vietnamese, **not a translation gap**. Zero keys are present in `vi` but missing from `en`. No empty-string values in either file. **The two locale files are structurally sound and in sync.**

### 3.3 Hardcoded (non-localized) strings — real gaps found

1. **`src/features/onboarding/DatePickerCalendar.tsx:43,52`** — hardcoded English accessibility labels `"Previous month"` / `"Next month"`. Screen-reader-only, but still user-facing content that should route through `t()` per this project's i18n rules. **Severity: Low** (narrow scope, one component).
2. **date-fns locale gap (more significant)**: no file anywhere imports `date-fns/locale`, so every `format()` call uses date-fns's default English locale for month/weekday tokens (`MMMM`, `EEEE`/`EEEEE`), even when the app is in Vietnamese mode. Affected call sites: `InsightsScreen.tsx:139-140`, `CalendarScreen.tsx:72,81,84,95,100,105,120`, `DayDetailSheet.tsx:55`, `DatePickerCalendar.tsx:49`, `CalendarDayCell.tsx:64`, `WeekStrip.tsx:20`. **Inferred**: a Vietnamese-language user will see English month names ("July") and weekday abbreviations throughout Calendar, Insights, and the onboarding date picker — a real, visible localization inconsistency on primary screens. **Severity: Medium.**

`Alert.alert` usage is a single call site (`onboarding/account.tsx:105`), correctly wrapped in `t()`. No hardcoded `<Text>` literal content was found in the sampled feature screens (Home, Settings, Onboarding, Paywall, Log, AI Chat) — all route through `t()`.

### 3.4 Terminology, tone, disclaimers
- **Medical/privacy copy**: `DisclaimerBox` full medical-disclaimer text is shown on the onboarding disclaimer screen and referenced in Settings; AI Coach responses append a disclaimer line for health-related intents (see `03-business-rules.md`).
- **Premium copy**: static localized price strings (`paywall.plans.monthlyPrice` etc.) — **not** live store pricing, since there is no IAP integration (see `11-monetization-analytics-notification.md`).
- **Mock transparency**: `en.json:448` — `"mockNote": "Purchases are mocked in this build."` — the codebase itself documents that the purchase flow is not real, which is a useful signal that this is a known, intentional state rather than an oversight.
- **Tone of voice**: Not exhaustively audited across all 316 keys; sampled copy (onboarding, disclaimers, paywall) reads as warm/editorial, consistent with the visual identity in `07-design-system-audit.md`.

## Files reviewed
`assets/dialuna/*` (via `find`/`du`), `app.json`, `src/i18n/index.ts`, `src/i18n/en.json`, `src/i18n/vi.json` (parsed programmatically for key-shape diff), grep sweep of `src/features/**`+`src/app/**`+`src/components/**` for hardcoded text/`Alert.alert`/`date-fns` locale usage.
