# 13 — Code Quality & Technical Debt

Actual commands were run (not assumed): `npx tsc --noEmit` (0 errors), `npx eslint .` (0 errors, 3 warnings), `npx vitest run` (39/39 tests passing across 6 test files, 221ms). All findings **Confirmed from code** unless tagged otherwise.

## Summary table

| Severity | Issue | Impact | File(s) | Evidence | Recommendation |
|---|---|---|---|---|---|
| **Critical** | Unguarded dev premium-override toggle shipped in Settings UI | Any user can self-grant permanent premium, bypassing the entire paywall | `src/features/settings/SettingsScreen.tsx:346-350`, `src/store/usePremiumStore.ts:46-50` | No `__DEV__`/env guard found around the toggle's render | Wrap in `if (__DEV__)` or remove before any production build; see `14-risk-register.md` |
| High | No `version`/`migrate` config on any of the 4 persisted Zustand stores | Future field rename/removal has no forward-migration path; stale/partial data can silently persist across app updates | `useUserStore.ts`, `useLogStore.ts`, `usePremiumStore.ts`, `useSettingsStore.ts` | `persist(...)` calls confirmed to omit `version`/`migrate` | Add explicit `version` + `migrate` before the first schema change ships |
| Medium | No `date-fns/locale` import — Vietnamese-mode users see English month/weekday names | Visible localization defect on primary screens (Calendar, Insights, onboarding date picker) | `InsightsScreen.tsx:139-140`, `CalendarScreen.tsx` (7 sites), `DayDetailSheet.tsx:55`, `DatePickerCalendar.tsx:49`, `CalendarDayCell.tsx:64`, `WeekStrip.tsx:20` | Zero `date-fns/locale` imports anywhere in `src/` | Pass `{ locale: vi }` conditionally based on current `i18n.language` |
| Medium | `insightsEngine.computeInsights` reads `new Date()` internally instead of accepting `today` as a parameter | Hidden wall-clock dependency; breaks the determinism pattern its sibling engines follow; harder to unit-test edge dates | `src/services/insightsEngine.ts:80` | Confirmed — sibling engines (`cycleEngine`, `hormoneTwinEngine`) take `date`/`today` explicitly | Add a `today` parameter with a default of `new Date()` for backward compatibility |
| Medium | No error boundary anywhere in the app | Any render-time exception in any screen crashes with no fallback UI | Entire `src/app`/`src/features` tree | Zero `ErrorBoundary`/`componentDidCatch` matches | Add a root-level error boundary in `src/app/_layout.tsx` |
| Low-Medium | `HomeScreen.tsx` (499 lines) and `SettingsScreen.tsx` (442 lines) are large, growing screen files | Maintainability/readability cost; still within this project's "screens live in `src/features`" architecture norm | `src/features/home/HomeScreen.tsx`, `src/features/settings/SettingsScreen.tsx` | Line counts via `wc -l` | Consider extracting sub-sections (e.g. Home's "Plan" card, Settings' subscription section) into their own components as they grow further |
| Low | `GlassCard.tsx` and `ScoreRing.tsx` are dead code — zero import sites anywhere in `src/` | ~94+ lines of maintained-but-unused UI, and `GlassCard`'s name misleadingly implies it renders glass (it doesn't — `GlassSurface` does) | `src/components/ui/GlassCard.tsx`, `src/components/ui/ScoreRing.tsx` | Confirmed via cross-file import grep | Delete, or confirm against any design roadmap before removing |
| Low | Hardcoded a11y strings bypass i18n | 2 screen-reader-only strings not localized | `src/features/onboarding/DatePickerCalendar.tsx:43,52` | `accessibilityLabel="Previous month"` / `"Next month"` literal | Route through `t()` like every other user-visible string |
| Low | `Stepper.tsx` +/- buttons are 38×38 with no `hitSlop` | Below the app's own 44pt touch-target standard, uncompensated | `src/features/onboarding/Stepper.tsx:67-69` | Confirmed — the one uncompensated undersized target found in the a11y sweep | Add `hitSlop` or increase to 44×44 |
| Low | Duplicated "dark hero panel" hardcoded colors (`#2c2620`/`#f4ede1`) across 3 screens instead of a shared token/component | Maintenance/drift risk — a future palette retune must be applied in 3+ places by hand | `InsightsScreen.tsx`, `CalendarScreen.tsx`, `LogScreen.tsx` (6 occurrences), `PremiumBanner.tsx` | Values match `premiumBannerGradient`/`paywallColors` but aren't imported from them | Extract a shared `DarkHeroPanel` component or a named token pair |
| Low | Unused installed dependencies: `react-hook-form`, `@hookform/resolvers`, `expo-image`, `expo-device`, `expo-linking`, `expo-symbols`, `expo-system-ui`, `expo-web-browser`, `@expo/ui` | Bundle/install-size noise, no correctness risk; `react-hook-form`+`zod` both installed but only `zod` is used (manual validation, not `react-hook-form`) | `package.json` | Zero `src/` import sites found for each, confirmed by grep | Remove if genuinely unused, or start using `react-hook-form` if the manual-validation pattern in `onboarding/account.tsx`/`SettingsScreen.tsx` was meant to be replaced |
| Low | `duration`/`easing` motion tokens have zero consumers; every animation hardcodes its own timing | No functional bug, but a future global timing change requires touching every screen individually instead of one token file | `src/theme/motion.ts` (unused exports), 17 files with hardcoded ms values | See `08-motion-interaction-audit.md` for the full list | Adopt the tokens screen-by-screen, or remove them if intentionally superseded |
| Low | Two screens hand-roll one-off spring configs that are near-duplicates of `springs.soft` | Minor motion-language drift | `SettingsScreen.tsx` (damping 18/stiffness 140), `DayDetailSheet.tsx` (damping 17/stiffness 150) vs. `springs.soft` (16/120) | See `08-motion-interaction-audit.md` | Reuse `springs.soft` unless the deviation is an intentional feel choice |
| Low | No reduced-motion support anywhere | Every animation (including the always-on `BlobGlow` ambient loop) ignores the OS Reduce Motion setting | Entire animation surface, see `08-motion-interaction-audit.md` | Zero `AccessibilityInfo`/`ReduceMotion` references found | Gate ambient/decorative animation behind `AccessibilityInfo.isReduceMotionEnabled()` |
| Low | `BlobGlow`/`TypingDots` start infinite `withRepeat` loops without explicit `cancelAnimation` cleanup | Not a confirmed leak (Reanimated's own teardown likely handles it), but deviates from the recommended defensive pattern; `TypingDots` mounts/unmounts frequently by design | `src/components/ui/BlobGlow.tsx:23-29`, `src/components/ai/TypingDots.tsx:20-33` | Confirmed no cleanup function returned from the owning `useEffect` | Add `return () => cancelAnimation(sharedValue)` |
| Low | 3 ESLint warnings | Cosmetic only | `.codex/skills/design-system/scripts/generate-tokens.cjs:148` (out of scope, not app source), `src/i18n/index.ts:27,39` (`import/no-named-as-default-member`, a known benign i18next CJS/ESM interop false positive) | `npx eslint .` output | Optional: silence with a targeted eslint-disable comment |

## What was checked and found clean (worth recording, not just "nothing was checked")

- **`: any` / `as any`**: zero occurrences anywhere in `src/`.
- **Non-null assertions** (`!.`, bare `!`): zero occurrences.
- **`console.log`/`.warn`/`.error`**: zero occurrences.
- **`TODO`/`FIXME`/`XXX`/`HACK`**: zero occurrences.
- **`tsc --noEmit`**: 0 errors.
- **`eslint .`**: 0 errors.
- **`vitest run`**: 39/39 tests passing.

This is a genuinely clean codebase on these axes — TypeScript strict mode is enforced with no escape hatches found anywhere in the ~7,055 lines reviewed.

## Not found / not applicable in this codebase
Circular dependencies, misuse of `memo`, unhandled promises, race conditions, memory leaks (beyond the animation-cleanup note above), stale closures, and expensive-computation re-render issues were not specifically flagged by any research pass — **Unclear / requires confirmation** that this reflects genuine absence vs. audit scope limits (a component-level render-profiling pass was not performed; this audit is static-code-read only).

## Files reviewed
Full `src/` tree via targeted greps for each debt category, `package.json` dependency cross-reference, `tsconfig.json`, `eslint.config.js`, and live execution of `tsc`, `eslint`, `vitest`.
