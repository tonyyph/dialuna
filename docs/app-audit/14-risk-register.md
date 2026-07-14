# 14 — Risk Register

Consolidated across all audit sections. Severity follows the same Critical/High/Medium/Low scale as `13-technical-debt.md`; this register is scoped to *product/business/UX risk*, while `13-technical-debt.md` is scoped to *code-quality debt* — some items necessarily appear in both with a different framing.

## Critical

| Risk | Description | Evidence | Owner area | Recommendation |
|---|---|---|---|---|
| Unguarded dev premium-override toggle in production Settings UI | Any user can tap a visible "Dev: premium override" switch to permanently self-grant premium, persisted to disk, fully bypassing the paywall/monetization funnel | `src/features/settings/SettingsScreen.tsx:346-350`, `src/store/usePremiumStore.ts:46-50` — no `__DEV__` guard found | Monetization | Gate behind `__DEV__` or a build-time flag, or remove entirely, before any release build. Confirm whether an existing build pipeline already strips this (not found in this audit — treat as present until proven otherwise) |

## High

| Risk | Description | Evidence | Owner area | Recommendation |
|---|---|---|---|---|
| No real payment backend behind the paywall | The entire subscription funnel — including "Restore Purchases" — is a local mock. Shipping this as-is to production would mean **no user can be legitimately charged**, and any user can "purchase" premium for free by tapping Subscribe | `src/store/usePremiumStore.ts:42-45`, confirmed absence of any IAP SDK in `package.json` | Monetization | This is very likely already known/intentional given `en.json:448`'s `mockNote` — but it is the single largest gap between current state and a shippable product. Treat as the top item in any pre-launch checklist |
| No persisted-store schema migration path | None of the 4 persisted Zustand stores declare `version`/`migrate`. Any future field rename/removal risks silently stale or partially-shaped data for existing installs after an app update | `useUserStore.ts`, `useLogStore.ts`, `usePremiumStore.ts`, `useSettingsStore.ts` | Architecture/Data | Add `version` + `migrate` to each `persist()` call before the next schema-affecting change ships |
| No authentication / account system | There is no way to recover a profile if a device is lost, no cross-device sync, and "Sign in with Apple" is a non-functional stub | `src/app/onboarding/account.tsx:102-106` | Architecture/Product | Decide deliberately whether auth is in scope for the next milestone; if so it is a foundational (not incremental) addition — see `15-recommended-next-steps.md` Phase 1/2 |

## Medium

| Risk | Description | Evidence | Owner area | Recommendation |
|---|---|---|---|---|
| `date-fns` locale gap breaks Vietnamese-mode date formatting | Vietnamese users see English month/weekday names on Calendar, Insights, and the onboarding date picker | 7+ call sites, see `10-assets-content-localization.md` | Localization | Apply `{ locale: vi }` conditionally |
| `signOut()` does not clear `profile`, only `hasOnboarded` | Leaves a transient inconsistent state (`hasOnboarded:false` + stale `profile` still in storage); mitigated today because re-onboarding overwrites `profile`, but not defensively guarded | `src/store/useUserStore.ts:28-29` | Data/Auth | Clarify intended semantics: should "sign out" behave like a lighter "delete all data", or is retaining `profile` intentional (e.g. for a future "sign back in")? |
| No error boundary anywhere in the app | Any render-time exception crashes with a blank/frozen screen, no recovery UI | Entire `src/app`/`src/features` tree | Reliability | Add a root-level error boundary |
| `insightsEngine.computeInsights` has a hidden `new Date()` dependency | Breaks the determinism pattern used elsewhere; complicates testing "what did Insights show on date X" | `src/services/insightsEngine.ts:80` | Code quality | Accept `today` as a parameter |
| No reduced-motion support | Every animation, including the always-on ambient `BlobGlow` loop, ignores the OS Reduce Motion accessibility setting | See `08-motion-interaction-audit.md` §5e | Accessibility/Motion | Gate decorative/ambient animation behind `AccessibilityInfo.isReduceMotionEnabled()` |
| No analytics/crash reporting | Zero visibility into real-world crashes, funnel drop-off, or feature usage once this ships beyond local development | Confirmed absent, see `11-monetization-analytics-notification.md` | Product/Ops | Deliberate decision point before broader release — not a defect at prototype stage |
| Onboarding draft is not persisted | An app kill mid-onboarding loses all in-progress answers, forcing a full restart from Welcome | `src/features/onboarding/useOnboardingDraft.ts:37` | UX | Confirm intentional; if not, persist the draft the same way `useUserStore` is persisted |

## Low

| Risk | Description | Evidence | Owner area | Recommendation |
|---|---|---|---|---|
| "Export data" is a UI stub with a success flash but no actual export | Users who tap Export believe data was exported when nothing happened | `SettingsScreen.tsx:269` | Product/Trust | Implement or remove the affordance before it's user-visible in a release build |
| Dead components (`GlassCard`, `ScoreRing`) | Maintained-but-unused code; `GlassCard`'s name misleadingly implies a glass effect it doesn't have | See `07-design-system-audit.md` §5 | Code quality | Delete or wire up |
| Duplicated hardcoded "dark hero panel" colors across 3 screens | Palette drift risk on future retunes | See `07-design-system-audit.md` §2.3 | Design system | Extract shared token/component |
| `Stepper.tsx` undersized touch targets (38×38, no hitSlop) | Below the app's own 44pt touch-target standard | `src/features/onboarding/Stepper.tsx:67-69` | Accessibility | Add hitSlop or resize |
| Hardcoded a11y strings bypass i18n | 2 strings in `DatePickerCalendar.tsx` | See `10-assets-content-localization.md` §3.3 | Localization | Route through `t()` |
| No push notification delivery despite UI toggles suggesting otherwise | Users can enable "period reminder" etc. and nothing will ever fire | `useSettingsStore` toggles, no `expo-notifications` anywhere | Product/Trust | Either implement scheduling or make clear in-UI that this is coming soon (a caption already exists — confirm it's sufficiently clear) |
| Unused installed dependencies | `react-hook-form`, `@hookform/resolvers`, `expo-image`, and 6 others have zero `src/` usage | See `13-technical-debt.md` | Code quality | Remove or adopt deliberately |

## Files reviewed
Synthesized from `02` through `13` — no new source files read specifically for this document.
