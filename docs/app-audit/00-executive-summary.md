# 00 — Executive Summary

**Dialuna** is an Expo/React Native menstrual-cycle and hormone-wellness tracking app with a polished "lunar wellness" visual identity — warm gold/amber tones, soft translucent surfaces, restrained glassmorphism, and an editorial serif/sans typography pairing. It runs entirely **local-first**: there is no backend, no API, and no authentication. A user completes a 6-step onboarding wizard, and from that point on, all cycle predictions, "Hormone Twin" wellness scores, insights/analytics, and AI-coach responses are computed **on-device** by pure, unit-tested TypeScript engines, from data the user themselves logs.

## What was audited
91 TypeScript/TSX source files (~7,055 lines) across `src/app`, `src/features`, `src/components`, `src/services`, `src/store`, `src/theme`, `src/types`, `src/utils`, `src/i18n`, plus `package.json`, `app.json`, `tsconfig.json`, `eslint.config.js`, assets, and the full git history of the current branch. Every claim across this document set is tagged **Confirmed from code**, **Inferred from code**, or **Unclear / requires confirmation**, and cites a specific file and, where practical, a line number.

## What Dialuna does today (Confirmed from code)
- **Cycle tracking**: phase/period/ovulation/fertile-window/PMS-window prediction from one self-reported reference cycle — fully implemented, unit-tested, free for all users.
- **Hormone Twin**: a daily synthetic energy/mood/focus/pain snapshot from a phase-based lookup table, lightly adjusted by the user's own recent self-reported levels — **not measured biometric data**.
- **Insights**: symptom-frequency ranking, per-phase averages, cycle regularity — free summary, premium-gated detail cards.
- **AI Coach**: a chat-style Q&A surface that is **not backed by a real AI model** — it's a deterministic keyword classifier composing localized string templates, with a hardcoded 600ms delay to simulate "typing."
- **Daily logging**: one entry per calendar day, feeding the two engines above.
- **Premium/paywall**: a fully real, animated UI wired to a **fully mocked backend** — `purchase()` grants premium with a local state mutation, no receipt, no IAP SDK; "Restore Purchases" is a documented no-op. The codebase itself is explicit about this (`src/i18n/en.json:448`: `"mockNote": "Purchases are mocked in this build."`).
- **Onboarding, Settings, Calendar** — all fully implemented UI/UX flows.

## Current state assessment
**Prototype / advanced-fidelity MVP** — by clear intentional design, not accidental incompleteness. Code craftsmanship is production-grade (TypeScript strict, zero `any`, zero non-null assertions, zero TODOs, 39/39 tests passing, clean `tsc`/`eslint`). But three of the product's core value props are simulated rather than real: payments, AI, and notifications. The current branch (`feature/prototype-fidelity-motion`) is mid-way through a deliberate, coherent visual/motion polish pass layered on top of an already feature-complete prototype. Full reasoning in `15-recommended-next-steps.md` §13.1.

## Top 10 findings
1. **Critical** — A "Dev: premium override" toggle is rendered unconditionally in the shipped Settings screen with no `__DEV__` guard found, letting any user permanently self-grant premium. (`SettingsScreen.tsx:346-350`)
2. **High** — The entire subscription/payment flow is a local mock with no IAP SDK; no user can be legitimately charged as the app stands today. (`usePremiumStore.ts:42-45`)
3. **High** — None of the 4 persisted Zustand stores declare a `version`/`migrate` strategy, risking silent stale data on the first schema change. (`useUserStore.ts`, `useLogStore.ts`, `usePremiumStore.ts`, `useSettingsStore.ts`)
4. **High** — There is no authentication system; "Sign in with Apple" is a disabled placeholder. (`onboarding/account.tsx:102-106`)
5. **Medium** — No `date-fns/locale` import anywhere means Vietnamese-mode users see English month/weekday names on Calendar, Insights, and onboarding.
6. **Medium** — No error boundary exists anywhere in the app; any render exception is an unrecoverable blank screen.
7. **Medium** — `insightsEngine.computeInsights` has a hidden `new Date()` dependency, breaking the determinism pattern its sibling engines follow. (`insightsEngine.ts:80`)
8. **Medium** — No analytics, crash reporting, or push-notification delivery exists despite Settings exposing notification toggles that currently do nothing.
9. **Low** — Two components (`GlassCard.tsx`, `ScoreRing.tsx`) are fully built but never imported anywhere — dead code.
10. **Low** — The shared `duration`/`easing` motion tokens in `src/theme/motion.ts` have zero consumers; every screen hardcodes its own animation timing instead.

## Document map
See `README.md` for the full navigable index and required architecture/flow diagrams.
