# Remus Chart + Capture atoms — Increment 010

Figma sources: `14 Atoms — Chart Primitives (330:2)` and `15 Atoms — Capture (499:2)`.

- `RemusChartMark` draws six canonical **static specimens** (220×96): line, area, bar, range, historical and secondary; these are not data-driven charts. The chart molecule owns actual sampling, scales, cursor and selection.
- `RemusChartRule` draws four static guide specimens (220×44): grid, reference, selection and threshold.
- `RemusBatteryStatus` renders four source-reported battery conditions (26×16). This atom never estimates recording duration or battery percentage.
- `RemusSourceBadge` shows four canonical source initials at 44×44; does not infer source ID or connection state.
- `RemusCaptureFab` renders the 64×64 Pause and Finish actions. Parent must supply a meaningful accessible label, handle onPress, and confirm destructive actions where needed. The debug gallery only updates local feedback.
- Status Mark and Coverage Mark are deferred: Figma currently renders white placeholder states without semantic differentiation. Do not invent telemetry semantics.
- The development gallery has a fixed theme selector outside its ScrollView, inside Safe Area; no business logic.

Validation: use `npm run verify` and iOS/Android QA in both Athlete themes before commit.
