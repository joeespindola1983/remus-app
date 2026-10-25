# REMUS / Unified Chart — Golden Master fidelity contract

**Primary references**

- `REMUS_Chart_Gold_Master.md` (canonical interaction contract)
- `REMUS_Chart_Component_Visual_System_v1.0-rc2_FINAL.pdf` (29-page approved visual spec)
- Approved executable Golden Master HTML (its visuals and example session are authoritative)
- Figma `22 Molecules — Unified Charts` (`330:3`), **subject to reconciling any mismatch against the Gold Master**.

The visualization in `RemusUnifiedChart` is a **QA prototype**, not a final approved chart. The rest of the molecules can be approved independently.

## Non-negotiable behavior

1. Chart is a reading surface; **no crop handles overlay the main plot**.
2. Navigator is **always below** the main plot and owns zoom/crop. Both handles and the window must move continuously. Reset lives in navigator header.
3. Semantically identified segments appear below navigator and select the **same** canonical range.
4. Y is **always Auto** (not a user-facing toggle). For a single metric, trim outliers, use minimum span and headroom; overlays use zero-based common Y and largest visible plotted value. Pace is minutes per 500 m **only when plotted in mixed overlays**.
5. Metric toggles are additive, with at least one active. Most recently added is primary; removing primary promotes most recent remaining metric.
6. Time/Distance are projections of the **same physical selected activity range**, not independent selections.
7. Contextual metrics, map, source panel, analysis and annotations consume a shared `ChartSelection` supplied by a parent; never keep conflicting private selections.
8. Sparse HR stays sparse. Invalid SPM/pace and source outages create **actual gaps**, not interpolated lines.
9. Tooltip uses nearest observed sample and lists every active metric with units; where sparse data is unavailable the value remains `—`.
10. Portrait/landscape preserve navigator location and interpretation. Gesture alternatives and summaries support accessibility and reduced-motion.

## Implemented in current QA iteration

- Pure TS selection transforms, metric registry, Y domain and missing-data subpath generation in `chartContract.ts` with regression tests. **No sport summary calculation is performed by the renderer or chart contract.**
- Stateful/controlled prop API; Time/Distance; multi-metric toggles; compact and detailed density; viewport axes and grid; selected-range summary cards; semantic segment bands; sparse HR dots; navigator with isolated crop handles; sample tooltip and non-gesture pan controls.
- QA gallery reads the **exact 2,267 dense activity rows, 40 sparse HR observations and 6 segments** from the approved `REMUS_Chart_Gold_Master.html` fixture (17 Sep 2026); the initial viewport selects `piece1`, 570–950 seconds, matching the reference. Other molecule examples remain fictional.
- Weather Date Rail, Weather Metric Dropdown and 12-Hour Conditions preview.

## Data ownership (Increment 012)

`RemusUnifiedChart` and `RemusUnifiedDetailedChart` now accept `summary?: ChartContextSummary | null` as a display-only prop. The summary includes the **physical selected time range** (`start`, `end` in elapsed seconds), `averageSpm`, `averageSplitSecondsPer500m`, `distanceMeters`, and `durationSeconds`. `chartSummaryForSelection()` verifies that the summary belongs to the active range, so stale asynchronous responses are shown as `—`, never falsely relabeled as the new selection. Switching Time/Distance or metric overlays does not invalidate a summary if the physical range is unchanged.

- **Source of truth:** Remus C++ engine, processed local file/CSV, or backend. The app reads numeric series, quality/provenance, segments and computed summaries.
- **Renderer responsibilities:** drawing, navigation, axes, viewport Y scaling, time/distance projection, tooltip display and formatting. **No SPM detection, split calculation or athletic average is permitted in production UI.**
- **QA-only exception:** `src/design-system/dev/goldenChartSummaryFixture.ts` computes values from the frozen Gold Master **exclusively for the QA gallery**. It is not imported by `/molecules` and must not be used in production. Replace with engine-backed precomputed values in the live app.
- **No data yet:** show `—`; never silently recalculate derived metrics on the frontend.

## Required before declaring the Golden Master complete

- Audit the exact HTML Gold Master against RN rendered screenshots on iOS and Android (Light/Dark, compact/detailed, portrait/landscape); fix all visual mismatches.
- Add interaction instrumentation and native gesture tests for left handle, right handle, window dragging, 12 s minimum, edges, momentum and screen-reader alternatives.
- Refine the chart's tooltip follow mechanics, cursor inspection, event-marker geometry, source provenance and saved configurations against *executed* HTML snapshots, not mere visual approximations.
- Add comparison modes (prior effort, multi-source, coach), source gaps, semantic events, saved presets and wind thresholds where justified by data.
- Validate series scaling against frozen telemetry fixture, including realistic 5/10 Hz GPS, 200 Hz IMU-derived series, sparse HR, stationary invalid pace.
- Prevent drawing paths outside the plotting viewport; verify renderer does not overflow navigator.
- Build snapshot/interaction Golden tests from frozen session and PDF/HTML references; do not substitute synthetic demo as baseline.

**Data policy:** chart QA uses the frozen, recorded Golden Master activity (not synthetic). Other galleries use explicitly labeled simulated values; never duplicate sparse samples, infer unreported battery duration, or invent device reliability. The chart remains experimental until native gesture, visual parity and comparison QA are finished.
