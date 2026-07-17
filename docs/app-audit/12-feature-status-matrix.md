# 12 — Feature Status Matrix

Status values: Complete · Mostly complete · Partial · UI only · Logic only · Mock · Placeholder · Broken · Unused · Unclear.

| Feature | UI | Business logic | API | Persistence | Error handling | Analytics | Test | Overall status |
|---|---|---|---|---|---|---|---|---|
| Onboarding wizard (6 steps) | Complete | Complete | n/a | Draft: none (in-memory only); final profile: Complete | None (no error boundary; zod validation only blocks continue) | None | None | **Mostly complete** |
| Cycle tracking / prediction | Complete (Home hero, Calendar) | Complete, unit-tested | n/a | Derived, never stored | None (pure sync fn, no failure mode) | None | Complete (`cycleEngine.test.ts`) | **Complete** |
| Hormone Twin daily snapshot | Complete | Complete, unit-tested | n/a | Derived, never stored | None | None | Complete (`hormoneTwinEngine.test.ts`) | **Complete** |
| Insights / analytics | Complete | Complete, unit-tested | n/a | Derived, never stored | None | None | Complete (`insightsEngine.test.ts`) | **Complete** |
| Daily symptom/mood logging | Complete | Complete | n/a | Complete (`dialuna.logs`) | None (no invalid-state handling needed — sliders are UI-bounded) | None | None | **Mostly complete** |
| AI Coach chat | Complete | **Mock** — deterministic keyword/template engine, not a real model | n/a (no network call) | **None** — chat history lost on unmount/restart | None (nothing can fail) | None | Complete for the engine (`aiCoachEngine.test.ts`); chat UI/hook untested | **Mock** |
| Paywall / plan selection UI | Complete | UI logic complete | n/a | Plan choice not persisted until "purchase" | None (cannot fail) | None | None | **UI only (backend mocked)** |
| Purchase / subscribe | Complete UI | **Mock** — local state grant, no receipt/transaction | **None** — no IAP SDK | Complete (persists `isPremium`) | None (always succeeds) | None | None | **Mock** |
| Restore purchases | Complete UI (button) | **Placeholder** — documented no-op | None | n/a | n/a | None | None | **Placeholder** |
| Premium feature gating (Insights/Home/AI cap) | Complete | Complete | n/a | Reads persisted `isPremium` | None | None | None | **Complete** (gating logic itself is real and correctly wired, even though the thing it gates on is mocked) |
| Dev premium override toggle | Complete (shipped in Settings) | Complete but **unguarded** — no `__DEV__` check found | n/a | Complete | n/a | None | None | **Broken (unintended production exposure risk)** — see `14-risk-register.md` |
| Settings — profile/cycle edits | Complete | Complete | n/a | Complete | Silent rejection of invalid input (no visible error) | None | None | **Mostly complete** |
| Settings — notification toggles | Complete (UI) | **UI only** — no scheduling/permission logic anywhere | None | Complete (boolean state persisted) | n/a | None | None | **UI only** |
| Settings — export data | Complete (UI, success flash) | **Placeholder** — no export/share action performed | None | n/a | n/a | None | None | **Placeholder** |
| Settings — sign out | Complete UI | **Partial** — clears `hasOnboarded` only, not `profile` | n/a | Partial (see `14-risk-register.md`) | No confirmation dialog | None | None | **Partial** |
| Settings — delete all data | Complete | Complete (`resetAllData`, 2-step confirm) | n/a | Complete | Confirm-step present | None | None | **Complete** |
| Authentication (sign up/in, Apple sign-in) | UI stub only ("Sign in with Apple" button) | **Unused/Placeholder** — `Alert.alert` only | None | n/a | n/a | None | None | **Placeholder** |
| Deep linking | Default Expo Router behavior only | **Unclear** — no custom handling | n/a | n/a | n/a | None | None | **Unclear** |
| Localization (en/vi) | Complete for UI strings | Complete key parity | n/a | Persisted (`dialuna.lang`) | Silent fallback on read failure | None | None | **Mostly complete** — gap: `date-fns` locale not applied (see `10-assets-content-localization.md`) |
| Theme (light/dark) | Complete | Complete | n/a | Persisted | None | None | None | **Complete** |
| Analytics instrumentation | **Unused/Absent** | Absent | n/a | n/a | n/a | n/a | n/a | **Unused** |
| Push notifications (actual delivery) | Toggles only | **Unused/Absent** | n/a | Toggle state persisted | n/a | n/a | n/a | **UI only** |
| Design system (theme tokens) | Complete for color/typography/spacing; partial for radius/shadow consistency | n/a | n/a | n/a | n/a | n/a | Motion tokens partially tested (`motion.test.ts`) | **Mostly complete** |
| Motion system (`duration`/`easing`/`springs`/`staggerDelay`) | `springs`/`staggerDelay` adopted; `duration`/`easing` built but unused | n/a | n/a | n/a | n/a | n/a | Partial (`motion.test.ts` covers springs/stagger only) | **Partial** |
| `GlassCard` component | Built | n/a | n/a | n/a | n/a | n/a | None | **Unused (dead code)** |
| `ScoreRing` component | Built | n/a | n/a | n/a | n/a | n/a | None | **Unused (dead code)** |

## Notes on methodology
- "API" is `n/a` for nearly every row because the app has no backend — this is a deliberate architectural fact (see `09-state-data-api.md`), not a gap being under-reported.
- "Test" reflects the presence of a `*.test.ts` file exercising that logic; UI/screen-level testing does not exist anywhere in the repo (no component/integration tests found).
- Statuses reflecting mocked/placeholder behavior are **all self-consistent with the product's current stage** (see `15-recommended-next-steps.md` §"App status") rather than surprising regressions — the one item that reads as an unintended risk rather than a deliberate placeholder is the **unguarded dev premium toggle**.
