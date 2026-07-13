Investigate and fix this Dialuna bug:

$ARGUMENTS

Do not immediately edit code.

First:

1. Reconstruct the execution path from route to screen to store/service.
2. Identify state transitions, async effects, navigation side effects, and persisted data.
3. Inspect related tests and similar patterns elsewhere in `src`.
4. Find the root cause rather than patching only the visible symptom.
5. Check whether the bug affects localized copy, theme/layout, iOS, Android, or web.

Then implement the smallest safe fix and run relevant validation.

Do not change unrelated UI, naming, formatting, architecture, dependencies, or native config.
Do not commit or push.
