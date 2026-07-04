# Dialuna 🌙

An AI-powered menstrual cycle **wellness** companion built with Expo + React Native.
Dialuna simulates a personal **"Hormone Twin"** — a daily profile of cycle phase,
energy, mood, focus, pain risk and PMS probability — and turns it into gentle,
personalized coaching.

> **Not a medical device.** Dialuna does not diagnose, treat, or prevent any
> condition. All predictions are wellness estimates, not medical advice.

## Features (MVP)

- **Onboarding** — welcome, safety disclaimer, profile, last period, goals,
  notification soft-ask, paywall preview with "Continue free"
- **Home dashboard** — cycle day, phase badge, animated Hormone Twin score ring,
  period countdown, energy/mood/comfort/focus forecast cards, daily AI insight,
  7-day forecast, personalized daily plan (premium)
- **Calendar** — period, predicted period, fertile window, ovulation, PMS window,
  logged days; tap any day for its forecast
- **Daily log** — flow, 8 symptoms, 6 moods, energy/sleep/stress (1–10), workout,
  journal note, instant AI reflection after saving
- **AI Coach chat** — deterministic local engine, phase-aware answers in the
  answer → why → what-to-try → disclaimer structure; 3 free questions/day,
  unlimited with premium
- **Insights** — cycle overview, top symptoms, energy by phase, sleep pattern,
  next PMS window, monthly AI summary (premium)
- **Paywall** — mock monthly/yearly/lifetime purchase (no real payments)
- **Settings** — profile & cycle editing, EN/Tiếng Việt language switch, privacy
  explainer, medical disclaimer, delete-all-data
- **Bilingual** — full English and Vietnamese UI (device-locale default)

## Privacy

All data stays on the device (AsyncStorage). No accounts, no network calls,
no analytics, no API keys. "Delete all data" wipes everything permanently.

## Tech Stack

Expo SDK 57 · TypeScript (strict) · Expo Router · Zustand (+persist) ·
date-fns · i18next / react-i18next · react-native-reanimated · react-native-svg ·
Vitest for the pure-TS engines.

## Getting Started

```bash
npm install
npx expo start        # then press i (iOS simulator) or scan the QR with Expo Go
```

## Scripts

```bash
npm test              # vitest — cycle/twin/AI/insights engine tests
npm run typecheck     # tsc --noEmit
npm run lint          # expo lint
```

## Project Structure

```
src/
  app/            Expo Router routes (onboarding, tabs, paywall, settings)
  components/     Reusable UI (ui/, cycle/, ai/, paywall/)
  features/       Screen-level composition per domain
  services/       Pure engines: cycleEngine, hormoneTwinEngine, aiCoachEngine, insightsEngine
  store/          Zustand persisted stores (user, logs, premium)
  i18n/           en.json / vi.json + init
  theme/          Design tokens (colors, spacing, typography, radius, shadows)
  types/          Domain types
  utils/          Date & validation helpers
```

## How the engines work

- **cycleEngine** — from last period start + average lengths, computes cycle day,
  phase (menstrual → follicular → ovulation → luteal), next period, PMS window
  (last 5 days), ovulation estimate (14 days before next period) ± 3-day fertile
  window.
- **hormoneTwinEngine** — per-phase base scores adjusted by your recent logged
  energy/sleep/stress, producing the daily Hormone Twin profile and 7-day forecast.
- **aiCoachEngine** — keyword intent detection (EN + VI) → phase-contextual
  templated answers with automatic safety disclaimers for health-related topics.

## Roadmap

- RevenueCat subscriptions (replace mock paywall)
- Real AI via a backend proxy (never call LLM APIs directly from the client)
- Push notifications (expo-notifications)
- Apple Health / wearable import
- Data export (PDF/CSV), partner mode, dark mode

## Design docs

- Spec: `docs/superpowers/specs/2026-07-05-dialuna-mvp-design.md`
- Plan: `docs/superpowers/plans/2026-07-05-dialuna-mvp.md`
