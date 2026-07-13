Verify the current Dialuna changes.

Use this order unless the task gives a narrower validation path:

1. Inspect `git status --short`.
2. Run `npm run typecheck`.
3. Run targeted Vitest files for changed services/stores when applicable.
4. Run `npm test` when service/store/domain behavior changed broadly.
5. Run `npm run lint`.
6. Run `git diff --check`.
7. Review the final diff for unrelated changes.

Report:

- commands run
- pass/fail result for each command
- any validation skipped and why
- iOS/Android/web implications
- files that still need manual simulator or device QA
