# Dialuna Claude Code Guide

## Project Overview

Dialuna is an Expo React Native app using Expo Router, TypeScript strict mode, Zustand stores, Vitest tests, and localized `en`/`vi` copy. It is a hormone and cycle tracking product with a polished lunar wellness interface.

Read `package.json`, `app.json`, `tsconfig.json`, and the relevant source files before making implementation assumptions.

## Current Stack

- Package manager: npm, based on `package-lock.json`
- App runtime: Expo `~57.0.2`
- React Native: `0.86.0`
- React: `19.2.3`
- Routing: Expo Router with typed routes enabled
- State: Zustand stores under `src/store`
- Tests: Vitest under `src/**/*.test.ts`
- Styling: React Native `StyleSheet` plus project theme tokens under `src/theme`
- Localization: i18next resources under `src/i18n/en.json` and `src/i18n/vi.json`

## Source Map

- `src/app`: Expo Router route entries and layouts
- `src/app/(tabs)`: main tab route shells
- `src/features`: screen-level feature implementations
- `src/components/ui`: shared UI primitives
- `src/components/cycle`: cycle-specific UI components
- `src/components/ai`: AI chat components
- `src/components/mascot`: Luna mascot components
- `src/components/paywall`: premium/paywall components
- `src/services`: domain engines and business logic
- `src/store`: persisted and in-memory app state
- `src/theme`: colors, typography, spacing, radius, shadows, motion
- `src/types`: shared domain types
- `docs/superpowers`: existing design specs and implementation plans

## Primary Goals

1. Preserve existing business logic, user flows, navigation behavior, and localized content.
2. Make the smallest safe change required by the task.
3. Prefer existing components, stores, hooks, services, and theme tokens.
4. Keep unrelated refactors, formatting churn, dependency upgrades, and generated output out of the diff.
5. Maintain iOS, Android, and web implications for Expo unless the task explicitly narrows scope.

## Required Workflow

Before editing:

1. Inspect `git status --short`.
2. Read `package.json` and relevant route, screen, component, store, service, type, and test files.
3. Search for existing patterns before introducing new components or helpers.
4. Identify whether the task affects localization, navigation, persisted state, design tokens, or Expo native config.
5. For non-trivial work, present a concise plan and the expected files to change.

During implementation:

1. Keep changes scoped to the requested behavior.
2. Preserve public interfaces unless the task requires changing them.
3. Avoid `any`, broad type assertions, suppressed TypeScript errors, and silent error swallowing.
4. Do not introduce a dependency unless the project genuinely needs it.
5. Do not edit generated files.
6. Do not modify `.claude/settings.local.json`; it is a local personal settings file.

After implementation:

1. Run the narrowest useful validation first.
2. Prefer the project scripts listed below.
3. Review `git diff --check` and `git diff` before declaring completion.
4. Report what changed, what was verified, and what was not verified.

## Validation Commands

Use npm for this repository.

- TypeScript: `npm run typecheck`
- Lint: `npm run lint`
- Tests: `npm test`
- Single Vitest file: `npx vitest run path/to/file.test.ts`
- Start Expo: `npm run start`
- iOS dev build: `npm run ios`
- Android dev build: `npm run android`
- Web: `npm run web`

Do not claim a command passed unless it was actually run successfully.

## Architecture Rules

- Route files in `src/app` should stay thin and delegate real screens to `src/features`.
- Business logic belongs in `src/services`, stores, hooks, or typed helpers, not in visual components.
- Shared UI should live in `src/components/ui` only when it is actually reused.
- Reuse domain engines in `src/services` instead of duplicating cycle, hormone, insights, or AI-coach calculations.
- Keep state ownership clear. Avoid duplicating the same source of truth in component state and Zustand.

## UI And Design Rules

- Use existing theme primitives from `src/theme` before adding new visual constants.
- Avoid hardcoded colors, spacing, radii, font sizes, and shadows unless there is a narrow one-off reason.
- Keep the current Dialuna visual identity: refined lunar wellness, clear hierarchy, restrained premium polish.
- Do not replace established screen composition with generic stacked cards unless requested.
- Respect safe areas, keyboard behavior, content growth, and small-device layouts.
- Use accessible labels for icon-only actions and maintain usable touch targets.
- Avoid fixed heights for text-heavy or localized content.

## Localization Rules

- User-visible strings should be localized through the existing i18n setup.
- When adding or changing copy, update both `src/i18n/en.json` and `src/i18n/vi.json`.
- Check that Vietnamese copy fits compact UI surfaces.
- Do not remove existing translation keys unless all references are removed.

## Navigation Rules

- Use Expo Router conventions and typed routes.
- Keep route files aligned with the existing `src/app` structure.
- Prevent duplicate navigation from rapid taps where relevant.
- Preserve Android back behavior and modal/sheet dismissal behavior.
- Review deep-link implications when changing route names or path structure.

## Async, Store, And Persistence Rules

- Handle loading, success, empty, and failure states where async work is introduced.
- Prevent duplicate submissions for mutation flows.
- Ignore or cancel stale async results when screens can unmount or inputs can change.
- Do not log secrets, tokens, personal health data, OTPs, or raw user identifiers.
- Be conservative with persisted-store migrations and default values.

## Expo And Native Rules

- This repo currently uses Expo config as the source of truth. Native `ios/` and `android/` folders are ignored/generated.
- Do not run `expo prebuild --clean` unless explicitly approved.
- Do not edit generated native files as a source-of-truth fix.
- Prefer Expo config/plugins for persistent native configuration.
- Clearly state when a change requires rebuilding a development client.
- Do not modify bundle IDs, app schemes, splash config, icons, entitlements, Gradle, CocoaPods, signing, or deployment targets unless the task requires it.

## Git Rules

- Never use `git reset --hard`.
- Never discard uncommitted user changes.
- Never force-push.
- Do not commit unless explicitly requested.
- Do not modify unrelated files.
- Always inspect the final diff before declaring completion.

## Definition Of Done

A task is done only when:

- The requested behavior is implemented.
- Existing behavior outside the requested scope is preserved.
- Localization, theme, navigation, and platform implications are reviewed.
- TypeScript, lint, and relevant tests pass, or limitations are clearly reported.
- The final diff contains no unrelated changes.
