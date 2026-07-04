# Dialuna MVP — Design Spec

Date: 2026-07-05
Source: "Dialuna App Design and Development.pdf" (user-provided product spec)
Status: Approved by user (bilingual i18n, project at ~/dialuna, no Figma/mockup step — design system built directly in code)

## 1. Product Summary

Dialuna is a menstrual-cycle wellness app with an "AI Hormone Twin" — a locally
simulated AI profile that predicts cycle phase, energy, mood, focus, pain risk and
PMS probability, and delivers daily coaching. Positioned strictly as a
wellness/lifestyle coach: **not a medical device, no diagnosis, no treatment
advice**. MVP is fully offline: local cycle engine, deterministic mock AI coach,
mock subscription state. Monetized later via subscription (RevenueCat) and real
AI backend proxy.

## 2. Decisions Made With User

| Decision | Choice |
|---|---|
| UI language | Bilingual EN + VI via i18n (device-locale default, switchable in Settings) |
| Project location | `/Users/tony/dialuna`, own git repo |
| Figma step | Skipped — design tokens + reusable components in code instead |
| Styling | React Native `StyleSheet` + design tokens (no NativeWind) |
| Persistence | AsyncStorage (Zustand persist middleware) |
| AI | Local deterministic engine only; no API keys anywhere |
| Payments | Mock premium state with dev toggle; no RevenueCat yet |

## 3. Tech Stack

- Expo (latest stable SDK), React Native, TypeScript (strict)
- Expo Router (file-based navigation)
- Zustand + persist (AsyncStorage) for state
- React Hook Form + Zod for onboarding/log forms
- date-fns for all date math
- i18next + react-i18next + expo-localization for EN/VI
- react-native-reanimated for score ring / card entrance animations
- expo-haptics for feedback

## 4. Project Structure

```
src/
  app/                      # Expo Router
    _layout.tsx             # root: onboarding gate + providers
    index.tsx               # redirect based on onboarding state
    onboarding/             # 7-step flow (stack)
    paywall.tsx             # modal
    settings.tsx            # pushed from Home header
    (tabs)/
      _layout.tsx           # bottom tabs
      home.tsx  calendar.tsx  log.tsx  ai.tsx  insights.tsx
  components/
    ui/                     # Button, Card, Chip, ScoreRing, DisclaimerBox, EmptyState, ...
    cycle/                  # PhaseBadge, CalendarDayCell, ForecastCard, ...
    ai/                     # MessageBubble, SuggestedPrompts
    paywall/                # PlanCard, PremiumBanner
  features/                 # screen-level composition per domain
  store/                    # useUserStore, useCycleStore(logs? see below), useLogStore, usePremiumStore
  services/
    cycleEngine.ts          # pure functions: prediction + phase + windows
    hormoneTwinEngine.ts    # daily profile from prediction + logs
    aiCoachEngine.ts        # deterministic responses
  i18n/                     # setup + en.json + vi.json
  theme/                    # colors.ts spacing.ts typography.ts radius.ts shadows.ts
  types/                    # cycle.ts log.ts user.ts premium.ts
  utils/                    # date.ts validation.ts
```

## 5. Data Model (TypeScript types)

- **UserProfile**: id, nickname, ageRange, averageCycleLength, averagePeriodLength,
  lastPeriodStartDate, lastPeriodEndDate, goals[], createdAt
- **DailyLog**: date (yyyy-MM-dd key), flow, symptoms[], moods[], energyLevel,
  sleepQuality, stressLevel, workoutType, note, createdAt, updatedAt
- **CyclePrediction**: cycleDay, phase, nextPeriodStart, daysUntilPeriod,
  fertileWindowStart/End, ovulationEstimate, pmsWindowStart/End, confidenceScore
- **HormoneTwinDailyProfile**: date, cycleDay, phase, hormoneTwinScore,
  energyScore, moodScore, focusScore, painRisk, pmsProbability, coachMessage,
  foodTips[], workoutTips[], selfCareTips[]
- **PremiumState**: isPremium, plan, aiQuestionsUsedToday, lastResetDate

Enums: `CyclePhase` (menstrual | follicular | ovulation | luteal), `FlowLevel`,
`Symptom` (8 values), `Mood` (6 values), `WorkoutType` (6 values), `Goal` (7 values).

## 6. Cycle Engine (pure, tested)

Inputs: lastPeriodStartDate, averageCycleLength, averagePeriodLength, today.
- cycleDay = ((today − lastPeriodStart) mod cycleLength) + 1
- nextPeriodStart = lastPeriodStart + ceil-to-future multiples of cycleLength
- Phases: Menstrual day 1–periodLength; Follicular → day 12; Ovulation day 13–16;
  Luteal day 17 → end. PMS window = last 5 days before next period.
  Fertile window ≈ ovulation estimate (cycleLength − 14) ± 3 days.
- Forecast scores per phase (deterministic tables): menstrual = low energy/high
  pain; follicular = high energy/focus; ovulation = high social/confidence;
  luteal = mood-sensitive, lower intensity near period; PMS overlay raises pain
  risk + stress sensitivity.
- Logged data adjusts Hormone Twin scores (recent energy/sleep/stress logs shift
  the baseline slightly) so the app feels personalized.
- Unit tests with vitest/jest for date logic and phase boundaries.

## 7. AI Coach Engine (mock)

`generateAIResponse({question, userProfile, cyclePrediction, dailyLogs, hormoneTwinProfile})`
- Keyword-matches question intents (tired, HIIT/workout, cravings, mood, food,
  cramps, week-ahead, fallback) → template answers parameterized by current
  phase, scores, and recent logs. Structure: direct answer → why → what to try
  today → disclaimer when symptom/health-related.
- Localized via i18n templates (EN + VI).
- Free tier: 3 questions/day (reset by lastResetDate); premium unlimited.
  When exhausted → paywall modal.

## 8. Screens (MVP)

1. **Onboarding** (7 steps): Welcome hero → Safety disclaimer (must accept) →
   Basic profile (nickname, age range, cycle/period lengths) → Last period dates →
   Goal selection (multi) → Notification soft-ask (UI only, permission deferred) →
   Paywall preview with "Continue free". Saves profile, routes to tabs.
2. **Home**: greeting, cycle day + phase badge, animated Hormone Twin score ring,
   period countdown, 4 forecast cards (energy/mood/pain/focus), AI coach card,
   Log CTA, Ask AI CTA, 7-day forecast strip, premium banner. Settings in header.
3. **Calendar**: month view; markers for period, predicted period, fertile window,
   PMS window, high-energy days, logged days; tap a date → forecast sheet; legend.
4. **Daily Log**: flow selector, symptom chips, mood chips, 1–10 sliders
   (energy/sleep/stress), workout selector, journal note, save → AI reflection
   message + success animation.
5. **AI Coach**: chat UI, suggested prompt chips, typing indicator, free-tier
   counter, disclaimer footer, paywall gate after 3/day.
6. **Insights**: cycle regularity, average length, top symptoms, mood/energy
   patterns, sleep correlation, PMS prediction, AI monthly summary; empty state
   until enough logs.
7. **Paywall** (modal): benefits list, monthly/yearly (save badge)/lifetime plan
   cards, mock purchase → sets premium, restore button (mock), fine print.
8. **Settings**: profile edit, cycle settings, notification prefs (local only),
   language switch (EN/VI), privacy screen, medical disclaimer, export data
   (placeholder), delete all data (destructive confirm), dev premium toggle.

## 9. Design System (in code)

Palette from spec: Primary Rose #FF6B8A, Soft Rose #FFE4EA, Lavender #B99CFF,
Deep Plum #2A1438, Cream #FFF8F2, Card White #FFFFFF, Text #221326 / #7A667F,
Mint #6ED6B5, Peach #FFB86B, Error #F45B69. 8pt spacing grid, consistent radii
(cards ~24, chips pill), soft shadows, gradient headers, glass-style cards.
Typography: system font (SF Pro on iOS) with rounded/elegant weights — no
custom font dependency for MVP. Light mode only; token structure ready for dark.
Every screen ships with empty/loading/error states; large tap targets;
accessibility labels; haptics on key actions.

## 10. Safety, Privacy, Monetization

- Disclaimers ("wellness guidance, not medical advice") at onboarding, AI chat,
  insights/report, settings. Copy never diagnostic.
- All data local; privacy screen explains this; delete-all wipes stores.
- No network calls, no API keys.
- Free: tracking, calendar, log, basic insight, 3 AI q/day, basic prediction.
  Premium (mock): unlimited AI, 7-day detailed forecast, food/workout plans,
  monthly AI report, Hormone Twin detail.

## 11. Acceptance Checklist (from spec §19)

Onboarding complete and skippable to free • usable fully offline • AI limit +
premium gating works • disclaimers visible • consistent tokens (no hardcoded
random colors) • all screens reachable • `tsc --noEmit` clean • lint clean •
cycle-engine unit tests pass • no real AI keys.
