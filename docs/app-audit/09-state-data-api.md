# 09 — State, Data & API

All findings **Confirmed from code** unless tagged otherwise.

## 1. State Management

### 1.1 Categories of state present

| Category | Present? | Where |
|---|---|---|
| Local component state | Yes | `useState` throughout screens (e.g. chat messages, confirm-delete toggle, sheet visibility) |
| Global state | Yes | 5 Zustand stores, `src/store/**` |
| Server state | **No** — there is no server | — |
| Persisted state | Yes | 4 of the 5 stores, via AsyncStorage |
| Navigation state | Managed by Expo Router internally | — |
| Form state | Local component state + zod validation (not react-hook-form, despite it being installed) | onboarding/account.tsx, Settings inline edits |
| Animation state | Reanimated shared values, component-local | see `08-motion-interaction-audit.md` |

### 1.2 Store structure

| Store | File | Persisted? | Storage key | Shape |
|---|---|---|---|---|
| `useUserStore` | `src/store/useUserStore.ts` | Yes | `dialuna.user` | `{ profile: UserProfile \| null, hasOnboarded: boolean }` |
| `useLogStore` | `src/store/useLogStore.ts` | Yes | `dialuna.logs` | `{ logs: Record<string, DailyLog> }` |
| `usePremiumStore` | `src/store/usePremiumStore.ts` | Yes | `dialuna.premium` | `{ isPremium, plan, aiQuestionsUsedToday, lastResetDate }` |
| `useSettingsStore` | `src/store/useSettingsStore.ts` | Yes | `dialuna.settings` | `{ notifPeriod, notifOvulation, notifDaily, lutealLength, units, theme }` |
| `useOnboardingDraft` | `src/features/onboarding/useOnboardingDraft.ts` | **No** — plain `create()`, no `persist` wrapper | — | in-memory only |

**Actions** (mutators): `useUserStore.setProfile`, `.completeOnboarding`, `.signOut`, `.updateProfile` (Inferred name, used by Settings inline edits), `.reset`. `useLogStore.saveLog`. `usePremiumStore.purchase`, `.restore` (no-op), `.togglePremiumDev`, `.reset`, internal daily-counter reset logic. `useSettingsStore.set`-style setters for each field. `useOnboardingDraft` field setters + `.reset()`.

**Selectors**: plain Zustand selector functions at call sites (e.g. `usePremiumStore((s) => s.isPremium)`), no reselect/memoized-selector library in use.

**Middleware**: only Zustand's own `persist` middleware (backed by `createJSONStorage(() => AsyncStorage)`), applied to the 4 persisted stores. No logging/devtools middleware found.

**Hydration**: `useStoresHydrated()` (`src/app/_layout.tsx:20-52`) polls/subscribes to `persist.hasHydrated()` across all 4 persisted stores and gates the entire app's first render on all four completing.

**Reset / logout cleanup**: `resetAllData()` (`src/store/index.ts:10-15`) resets all 4 persisted stores to defaults — used by Settings "Delete all data". **Confirmed gap**: `signOut()` on `useUserStore` only flips `hasOnboarded: false`; it does **not** clear `profile`, `logs`, or `premium` state — see `14-risk-register.md`.

**Derived / duplicated state**: No duplicated source-of-truth was found between component state and store state in the files reviewed (a common anti-pattern this project's CLAUDE.md explicitly warns against) — screens read directly from stores/engines rather than mirroring store data into local state. `CyclePrediction`/`HormoneTwinDailyProfile`/`Insights` are derived on every read, never cached in a store (see `03-business-rules.md` §2.4).

## 2. API Architecture

**Confirmed: there is no API layer.** No base URL, no environment-specific endpoint config, no HTTP client (no `axios`, no custom `fetch` wrapper), no interceptor, no auth header injection, no token refresh, no error-mapping layer, no retry/timeout/cancellation logic, no cache, no pagination, no mutation layer, no optimistic-update pattern, and no offline-fallback logic exist anywhere in `src/` or `package.json`. Every feature that might conceptually be "server data" (cycle prediction, hormone twin scores, AI responses, insights) is instead computed synchronously and locally by the `src/services/**` engines from locally-persisted `UserProfile`/`DailyLog` data.

**No endpoint table** — there are no endpoints to document; this section is intentionally empty per the audit's "do not invent content" rule.

## 3. Local Storage

Backend: `@react-native-async-storage/async-storage` (`2.2.0`), wrapped by each store's Zustand `persist(createJSONStorage(() => AsyncStorage))` call.

| Storage key | Data type | Written by | Read by | Reset when |
|---|---|---|---|---|
| `dialuna.user` | `UserProfile \| null`, `hasOnboarded: boolean` | `useUserStore.setProfile`/`.completeOnboarding`/`.signOut`/`.updateProfile` | App launch redirect logic (`index.tsx`), Home/Calendar/Insights/Settings screens, all engines | `resetAllData()` (Settings "Delete all data") |
| `dialuna.logs` | `Record<string, DailyLog>` | `useLogStore.saveLog` (Log screen) | Home, Calendar, Insights, Hormone Twin/Insights engines | `resetAllData()` |
| `dialuna.premium` | `isPremium`, `plan`, `aiQuestionsUsedToday`, `lastResetDate` | `usePremiumStore.purchase`/`.togglePremiumDev`/daily-counter logic | Home, Insights, AiChatScreen, SettingsScreen (every premium-gate check) | `resetAllData()`; daily AI counter self-resets when `lastResetDate !== todayISO()` |
| `dialuna.settings` | notification toggles, `lutealLength`, `units`, `theme` | `useSettingsStore` setters (Settings screen) | Cycle engine (`lutealLength`), theme system (`useTheme`), Settings screen | `resetAllData()` |
| `dialuna.lang` | language override (`en`/`vi`) | `setAppLanguage` (`src/i18n/index.ts:37-42`) | i18n init on next launch | Not reset by `resetAllData()` — **Confirmed**: language preference survives "Delete all data" since it lives outside the Zustand store system entirely |

No MMKV, SecureStore/Keychain, SQLite, or custom file-system caching exists anywhere — AsyncStorage is the sole persistence mechanism.

**Persistence versioning gap (Confirmed)**: none of the 4 Zustand `persist` calls declare a `version`/`migrate` option. See `14-risk-register.md` for the upgrade-safety implication.

## 4. Mock Data

Confirmed inventory (all detailed with citations in `03-business-rules.md` §2.5):

1. AI Coach responses — deterministic keyword-template composition, not a real model.
2. Fake "typing" delay — hardcoded 600ms `setTimeout` in `useChat.ts`.
3. Hormone Twin scores — fixed hand-picked lookup table (`PHASE_SCORES`/`PMS_SCORES`), not measured biometric data.
4. `usePremiumStore.restore()` — documented no-op.
5. `usePremiumStore.purchase()` — unconditional local grant, no real transaction.
6. Dev-only premium bypass (`togglePremiumDev`) shipped unconditionally in Settings UI.
7. `insightsEngine.computeInsights` — hidden `new Date()` wall-clock dependency instead of a parameter.

No hardcoded demo arrays, seeded example profiles, or canned "example" log entries were found anywhere in the codebase — the app ships with genuinely empty state until a real user completes onboarding and logs data. `src/i18n/en.json:448` explicitly documents the mock purchase flow: `"mockNote": "Purchases are mocked in this build."`.

## Files reviewed
All 5 `src/store/*.ts` files (+ `useSettingsStore.test.ts`), `src/store/index.ts`, `src/i18n/index.ts`, `package.json`, plus cross-references to `src/services/**` and `src/features/**` consumers already cited in `02`/`03`.
