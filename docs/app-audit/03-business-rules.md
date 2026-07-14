# 03 — Business Rules Inventory & Data Model

All findings **Confirmed from code** unless tagged otherwise.

## 1. Business Rules Inventory

### `cycleEngine.ts`

| Rule | Formula / Value | Source of data | File:line | Confidence |
|---|---|---|---|---|
| Default luteal phase length | `LUTEAL_LENGTH_DEFAULT = 14` days | module const | `cycleEngine.ts:27` | Confirmed |
| PMS window length | `PMS_WINDOW_DAYS = 5` days before next period | module const | `cycleEngine.ts:26` | Confirmed |
| Fertile window spread | `FERTILE_SPREAD = 3` days each side of ovulation estimate | module const | `cycleEngine.ts:28` | Confirmed |
| Ovulation day (cycle-day index) | `ovulationDay = cycleLength - lutealLength + 1` | user profile | `cycleEngine.ts:38` | Confirmed |
| Follicular phase end | `max(periodLength, ovulationDay - 3)` | derived | `cycleEngine.ts:39` | Confirmed |
| Ovulation phase end | `min(cycleLength - 1, ovulationDay + 1)` | derived | `cycleEngine.ts:40` | Confirmed |
| Phase boundaries | `day ≤ periodLength → menstrual`; `≤ follicularEnd → follicular`; `≤ ovulationEnd → ovulation`; else `luteal` | derived | `cycleEngine.ts:41-44` | Confirmed |
| Which cycle a date falls in | `floor(daysBetween(lastPeriodStart, date) / averageCycleLength)` | user profile + date | `cycleEngine.ts:48-51` | Confirmed |
| Cycle day (1-based) | `daysBetween(cycleStart, today) + 1` | derived | `cycleEngine.ts:66` | Confirmed |
| Next period date | `cycleStart + averageCycleLength` days | derived | `cycleEngine.ts:67` | Confirmed |
| Ovulation estimate date | `cycleStart + (averageCycleLength - lutealLength)` days | derived | `cycleEngine.ts:70-73` | Confirmed |
| Fertile window | `ovulationEstimate ± 3` days | derived | `cycleEngine.ts:74-75` | Confirmed |
| PMS window | `[nextPeriodStart - 5, nextPeriodStart - 1]` | derived | `cycleEngine.ts:77-79` | Confirmed |
| "Unusual" cycle length flag | `averageCycleLength < 24 OR > 35` | user profile | `cycleEngine.ts:81-82` | Confirmed |
| Confidence score | `0.7` if unusual length, else `0.8` — only two discrete values, not a continuous statistic | derived | `cycleEngine.ts:100` | Confirmed |
| Pre-first-period normalization | `((cycleDay % cycleLength) + cycleLength) % cycleLength \|\| cycleLength` — maps dates before the tracked period into `[1, cycleLength]` | derived | `getDayInfo`, `cycleEngine.ts:118-121` | Confirmed |
| "Predicted" vs "actual" period flag | `phase === 'menstrual' AND cycleIndexFor(date) >= 1` (only checked when `date > lastPeriodStartDate`) | derived | `getDayInfo`, `cycleEngine.ts:128-135` | Confirmed |

### `hormoneTwinEngine.ts`

| Rule | Formula / Value | Source | File:line |
|---|---|---|---|
| Base phase scores (energy/mood/focus/pain/pms, 0-100) | menstrual `{35,50,45,70,10}`; follicular `{75,70,80,15,5}`; ovulation `{85,80,70,20,5}`; luteal `{55,55,55,35,30}` | fixed lookup table | `hormoneTwinEngine.ts:13-18` |
| PMS-window override scores | `{energy:40, mood:40, focus:45, pain:65, pms:85}` — fully replaces base scores when `prediction.isPmsWindow` | fixed lookup table | `hormoneTwinEngine.ts:20`, applied `:64` |
| Recent-log window | Up to 3 most recent logs on/before the date | `useLogStore` | `hormoneTwinEngine.ts:22,28-36` |
| Self-report neutral point | `NEUTRAL_LEVEL = 5.5` | const | `hormoneTwinEngine.ts:24` |
| Log-based shift | `clamp((avg - 5.5) * 4, -15, +15)` | user logs | `hormoneTwinEngine.ts:23,44-47` |
| Energy score | `clamp(round(baseEnergy + levelShift(avg(energyLevel + sleepQuality))))` | phase + logs | `hormoneTwinEngine.ts:67,72` |
| Mood score | `clamp(round(baseMood - levelShift(avg(stressLevel))))` — shift **subtracted** | phase + logs | `hormoneTwinEngine.ts:70,73` |
| Focus score | `clamp(baseFocus)` — **not adjusted by logs at all**, purely phase-driven | phase only | `hormoneTwinEngine.ts:74` |
| Composite Hormone Twin score | `round(0.4·energy + 0.3·mood + 0.3·focus)` | derived | `hormoneTwinEngine.ts:85-87` |
| Score clamp | `[0,100]` for all scores | — | `hormoneTwinEngine.ts:26` |
| Tip group selection | `isPmsWindow ? 'pms' : phase`; 3 tip keys per category (food/workout/self-care) | phase + PMS flag | `hormoneTwinEngine.ts:76-78` |
| Week forecast | 7 independent days, no smoothing/continuity between them | derived | `hormoneTwinEngine.ts:100-114` |

### `insightsEngine.ts`

| Rule | Formula / Value | File:line |
|---|---|---|
| Phase-of-log helper | `offset = ((daysBetween % cycleLength) + cycleLength) % cycleLength`, then `getPhaseForCycleDay(offset+1, ...)` — duplicates `cycleEngine`'s math rather than importing it | `insightsEngine.ts:19-34` |
| Rounding | `round(v*10)/10` (1 decimal) | `insightsEngine.ts:36-38` |
| Top symptoms | Count occurrences across all logs, sort desc, take top 3 | `insightsEngine.ts:93-96` |
| PMS vs. other sleep split | Bucketed by `getCyclePrediction(...).isPmsWindow` per log's own date | `insightsEngine.ts:62-69` |
| "Today" reference | `new Date().toISOString().slice(0,10)` — **hidden wall-clock dependency**, unlike sibling engines which take `date`/`today` as explicit parameters | `insightsEngine.ts:80` — flagged as a testability/determinism concern in `13-technical-debt.md` |
| Regularity label (UI-level) | `confidenceScore >= 0.8 → "regular"`, else `"variable"` | `InsightsScreen.tsx:77-80` |
| Minimum logs to unlock Insights screen | `MIN_LOGS = 3` | `InsightsScreen.tsx:22,40` |

### `aiCoachEngine.ts`

| Rule | Formula / Value | File:line |
|---|---|---|
| Intent keyword map (EN+VI), first match wins | Order: `cramps → tired → workout → cravings → sleep → mood → food → week`, else `general` | `INTENT_KEYWORDS`, `detectIntent`, `aiCoachEngine.ts:16-26,33-39` |
| Health intents requiring a disclaimer | `['tired','cramps','mood','cravings','sleep']` | `HEALTH_INTENTS`, `aiCoachEngine.ts:28,77-78` |
| "High energy" advice phases | `['follicular','ovulation']` and not in PMS window | `HIGH_ENERGY_PHASES`, `aiCoachEngine.ts:31,45-49` |
| Response composition | Concatenation of 3 i18n keys + optional disclaimer | `generateAIResponse`, `aiCoachEngine.ts:71-80` |
| Simulated typing delay | `COACH_DELAY_MS = 600ms` `setTimeout` | `useChat.ts:15,47-61` |
| Log reflection composition | `log.reflection.<phaseGroup>` + optional note for the **first** logged symptom only | `generateLogReflection`, `aiCoachEngine.ts:83-101` |

### Validation / limits

| Rule | Value | File:line |
|---|---|---|
| Nickname | 1-30 chars, trimmed, required | `validation.ts:3` |
| Average cycle length (zod schema) | integer, **20-45** | `validation.ts:5` |
| Average period length (zod schema) | integer, **2-10** | `validation.ts:7` |
| Average cycle length (onboarding Stepper UI bound) | **21-40** — narrower than the zod schema above | `cycle-basics.tsx:38-45` per `04-user-flows.md` — **Unclear / requires confirmation** whether this mismatch is intentional (UI is stricter than the schema that would also validate a Settings-screen edit) |
| Email | optional, else `z.string().email()`, max 120 chars | `validation.ts:16-22` |
| Luteal length (Settings) | clamped 10-16, rounded | `useSettingsStore.ts:32`, tested `useSettingsStore.test.ts:26-33` |
| Free AI questions/day | `FREE_AI_QUESTIONS_PER_DAY = 3` | `types/premium.ts:11` |
| Daily AI-question counter reset | Reset when `lastResetDate !== todayISO()` | `usePremiumStore.ts:25-27,38-41` |

## 2. Data Model

### 2.1 Types

**`src/types/user.ts`**
- `Goal` — union of 10 literal ids. `AgeRange` — union of 5 literal brackets.
- `UserProfile` — required: `id`, `nickname`, `averageCycleLength`, `averagePeriodLength`, `lastPeriodStartDate` (ISO), `lastPeriodEndDate` (required but nullable), `goals: Goal[]`, `createdAt`. Optional: `ageRange?`, `email?`, `symptomHistory?: Symptom[]`.
- No defaults on the type itself — defaults live in `useOnboardingDraft.ts` (cycle length 28, period length 5, empty arrays/strings, `lastPeriodStartDate: null`).

**`src/types/log.ts`**
- `FlowLevel`, `Symptom` (10 values), `Mood` (6 values), `WorkoutType` (6 values) — closed unions.
- `DailyLog` — `date` is the **unique key** (one log per calendar day). All fields required in the type (`energyLevel`/`sleepQuality`/`stressLevel` documented 1-10 but not type-enforced); UI supplies defaults when creating a new entry.

**`src/types/cycle.ts`**
- `CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'` — PMS is a boolean flag (`isPmsWindow`) layered on top of a phase, not its own phase value (though UI treats "pms" as a display pseudo-phase).
- `CyclePrediction`, `HormoneTwinDailyProfile` — both fully required-field, pure derived output, **never persisted**. Tip/message fields in `HormoneTwinDailyProfile` are i18n keys, not literal copy.

**`src/types/premium.ts`**
- `PremiumPlan = 'monthly' | 'yearly' | 'lifetime' | null`. **Confirmed from code**: `'lifetime'` exists in the type but has **no purchase UI path** — `PaywallScreen.tsx` locally narrows to `type Plan = 'monthly' | 'yearly'`.
- `PremiumState`: `isPremium`, `plan`, `aiQuestionsUsedToday`, `lastResetDate`.

### 2.2 Relationships
- `UserProfile` 1—1 `CyclePrediction`/`HormoneTwinDailyProfile`, computed per date, never stored against the profile.
- `UserProfile` + `Record<string, DailyLog>` (keyed by ISO date) combine at read time in the engines; a `DailyLog` holds no foreign key back to `UserProfile` (single-user app) or to `CyclePrediction`.
- No exported `CycleDay` type exists — the closest analog is an unexported `DayInfo` interface local to `cycleEngine.ts`.
- `OnboardingDraft` (in-memory, not in `src/types`) is structurally similar to but distinct from `UserProfile` (e.g. `email` is always-`string`, no `id`/`createdAt`); mapped into a real `UserProfile` at onboarding completion in `src/app/onboarding/account.tsx:28-48` (see `04-user-flows.md`).

### 2.3 Persistence (Zustand `persist` middleware)

| Store | Storage key | Backend | `version`/`migrate`? | Persisted shape |
|---|---|---|---|---|
| `useUserStore` | `dialuna.user` | AsyncStorage | **None** | `{ profile, hasOnboarded }` |
| `useLogStore` | `dialuna.logs` | AsyncStorage | **None** | `{ logs: Record<string, DailyLog> }` |
| `usePremiumStore` | `dialuna.premium` | AsyncStorage | **None** | `{ isPremium, plan, aiQuestionsUsedToday, lastResetDate }` |
| `useSettingsStore` | `dialuna.settings` | AsyncStorage | **None** | `{ notifPeriod, notifOvulation, notifDaily, lutealLength, units, theme }` |
| `useOnboardingDraft` | — | **not persisted** (plain `create()`) | n/a | in-memory only, lost on app kill |

**Confirmed risk**: none of the 4 persisted stores declare a `version`/`migrate` option. A future field rename/removal has no forward-migration path; Zustand's default shallow `merge` will combine old `AsyncStorage` contents with new defaults, which can leave stale/partial fields on existing installs. See `14-risk-register.md`.

`resetAllData()` (`src/store/index.ts:10-15`) wipes all four stores — used by Settings "Delete all data".

### 2.4 Derived vs. stored
- **Stored**: `UserProfile`, `Record<string, DailyLog>`, premium state, settings state.
- **Derived, never stored**: `CyclePrediction`, `HormoneTwinDailyProfile`/week forecast, `Insights`, AI chat messages (local component state only, lost on unmount/restart).

### 2.5 Mock / hardcoded / fake-async data (Confirmed from code)
1. AI "coach" — deterministic keyword classifier + i18n templates, no network/model call.
2. Fake typing latency — hardcoded 600ms `setTimeout` in `useChat.ts`.
3. Hormone Twin scores — fixed hand-picked lookup table, no sensor/wearable/lab input anywhere.
4. `usePremiumStore.restore()` — documented no-op (`// Mock: nothing to restore without a real store backend.`).
5. `purchase()` — grants premium unconditionally, no receipt, no transaction, no server round-trip.
6. Dev-only premium bypass shipped unconditionally in Settings UI (`togglePremiumDev`) — see `14-risk-register.md`.
7. `insightsEngine.computeInsights` reads `new Date()` internally instead of taking `today` as a parameter.

No other hardcoded demo/seed data was found.

## Files reviewed
`src/services/cycleEngine.ts(.test.ts)`, `hormoneTwinEngine.ts(.test.ts)`, `insightsEngine.ts(.test.ts)`, `aiCoachEngine.ts(.test.ts)`, `src/store/index.ts`, `useUserStore.ts`, `useLogStore.ts`, `usePremiumStore.ts`, `useSettingsStore.ts(.test.ts)`, `src/types/*.ts`, `src/utils/date.ts`, `src/utils/validation.ts`, `src/features/cycle/useCycleToday.ts`, `src/features/onboarding/useOnboardingDraft.ts`.
