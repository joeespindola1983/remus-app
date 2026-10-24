# REMUS Design System / Molecules — Increment 011

**Status:** first implementation / awaiting native visual QA and production integration.
**Source of truth:** [Remus Figma](https://www.figma.com/design/J9mlZzajI8meLd5KQYg4KB) pages 20 (Data Display), 21 (Weather), 22 (Unified Charts), 23 (Capture).
**Git:** apply as a single patch to `feature/design-system-foundations` after commit `356c9e6`.

## Catalog (31 entry points)

| Domain | Molecules (Figma canonical families) |
| --- | --- |
| Data Display (11) | `RemusMetricTile`, `RemusActivitySummaryCard`, `RemusMediaThumbnail`, `RemusEngagementBar`, `RemusShareFormat`, `RemusActivityOverlay`, `RemusBoatMarker`, `RemusNearbyBoatCard`, `RemusMapControlStack`, `RemusActivityFilterBar`, `RemusSettingsRow` |
| Weather (6) | `RemusDailyForecast`, `RemusWindSummary`, `RemusTrainingWindow`, `RemusWeatherAlert`, `RemusLocationContext`, `RemusTrainingWindowSummary` |
| Capture (9) | `RemusSourceStatusRow`, `RemusArtifactPartProgress`, `RemusActivityMatchCard`, `RemusRecordingRangeControl`, `RemusPermissionReadinessRow`, `RemusOperationalEventBanner`, `RemusResourcePressureCard`, `RemusFinalizationStatusRow`, `RemusLiveMetricCell` |
| Unified Charts (5) | `RemusUnifiedChart`, `RemusUnifiedDetailedChart`, `RemusForecastDateRail`, `RemusWeatherMetricDropdown`, `RemusTwelveHourConditionsChart` |

## QA gallery

Debug-only gallery: persistent Light/Dark toggle; `Átomos` / `Moléculas` switch; then `Data Display`, `Weather`, `Capture`, `Charts` tabs. Examples outside Charts are deterministic synthetic data. Charts loads the frozen recorded Golden Master session from the approved HTML source (2,267 rows + 40 sparse HR points), not a simulated sine wave. **Never interpret unrelated QA mocks as real measured or predicted athlete outcomes.**

## Boundaries

- Molecules accept source-provided content; no backend, GPS, Bluetooth, weather APIs or recording controls are wired up.
- Capture states distinguish suggested, selected, transferring, verified and interrupted; a suggested activity association is never treated as confirmed.
- Batteries display reported condition, not inferred capture duration. Storage pressure must receive an externally calculated estimate if displayed.
- Map spatial design uses temporary text/vector placeholders for some unimplemented Figma vessel/navigation icons; media thumbnails show placeholders until actual media URI provided. **These are not pixel-accurate final assets.** Replace with exact Figma exports in visual QA refinement.
- Narrow-screen rows use flex shrink/wrap constraints for source statuses, alerts, settings and training-window summaries; code-to-screenshot iOS/Android validation remains required.
- `RemusUnifiedChart` is **experimental**. Chart Gold Master v1.0-rc2 and its executable HTML remain authoritative. Do not ship or declare the chart homologated based only on this QA implementation.

## Chart-specific architecture and Golden Master

See [chart-golden-master-contract.md](chart-golden-master-contract.md). The chart uses one shared `ChartSelection`; toggles keep >=1 metric; axis switching preserves the same elapsed-time range; the navigator is below the main plot; segments are shortcuts to selected ranges; single metric and overlay use different Y-domain rules; sparse heart-rate data remains sparse.

## Validation

1. `git apply --check` then apply patch.
2. `npm run verify` (all existing tests, Jest, `tsc --noEmit`, ESLint warnings=0); stop if anything fails.
3. QA `Data Display`, `Weather`, `Capture`, `Charts` in Athlete Light/Dark on iOS/Android, both portrait and landscape where relevant.
4. Confirm controls change selection, not external data or firmware; all disabled controls and callbacks are respected.
5. Chart must pass independent Gold Master visual/gesture tests before production use.
6. Commit once approved: `feat(design-system): add molecule library`.

## Planned technical QA refinements

- Replace placeholders with official Figma icon/vector exports where existing `RemusIcon` lacks a corresponding symbol.
- Verify dynamic font sizes, truncation, small-screen width, voiceover/talkback, larger accessibility type, and contrast.
- Harden chart navigator touch handling at every device density; compare golden screenshots and 1-to-1 plot features.


**Architecture update 012:** chart contextual summary cards now accept precomputed `ChartContextSummary` from the engine, local processed data or backend. The QA gallery uses `goldenChartSummaryFixture.ts` only; the production React Native molecule no longer computes athletic metrics.
