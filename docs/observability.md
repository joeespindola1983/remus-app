# Remus observability

One Firebase project `remus-fc856` hosts separate QA and Production apps for Android and iOS.

## Application API

- `src/observability/telemetry.ts`: typed, injectable application boundary. No Firebase imports.
- `src/observability/telemetrySinks.ts`: SDK-free no-op and in-memory adapters for deterministic development, tests and future QA diagnostics.
- `src/observability/firebaseTelemetry.ts`: the only Firebase adapter.
- `index.js`: sends the custom Analytics event `remus_app_started` **once per JavaScript runtime startup**. Automatic lifecycle events remain available. This does not imply an event for every foreground/resume.
- For a future recoverable error: `void remusTelemetry.recordNonFatal(error)`. Do not put GPS positions, personal details, activity traces, or credentials in error messages.
- Both methods are best effort: Analytics / Crashlytics outages must not block a workout.
- The temporary Crashlytics QA button and activation script were removed.

## Collection control — 013A

`createTelemetry` accepts a function that reads the current Analytics and crash-reporting consent before every operation. Disabled channels never call their sink. If consent cannot be read, collection fails closed without affecting the app.

The event union permits `remus_app_started` and the payload-free `remus_qa_observability_probe`. The probe is exposed only by the debug gallery. New product events and their allowlisted, low-cardinality fields must be added explicitly; coordinates, routes, health data, names, email, persistent device identifiers, tokens and raw sensor data do not belong in Analytics events.

The TypeScript gate and Firebase SDK collection switches are coordinated by `telemetryCollectionControl.ts`. Both channels are blocked while settings are being applied and any failed channel remains blocked. The existing bootstrap starts enabled for compatibility.

## QA collection diagnostics — 013B

The debug-only **Diagnóstico** tab can apply Analytics and Crashlytics collection settings, send one payload-free QA event and record one explicit non-fatal error. It never triggers a crash. The `App` and preview receive these dependencies from `index.js`, keeping Firebase out of their unit-test boundary.

`firebase.json` explicitly enables Crashlytics in debug builds so the QA non-fatal probe reaches the native SDK on both platforms. Collection is still controlled at runtime by the diagnostic toggle; release behavior is unchanged by this debug-only switch.

The displayed choice is runtime QA state, not a persisted product consent preference. Firebase SDK setters may retain their native setting between launches, while the QA controller currently starts from the bootstrap default. Re-enable both channels after a disabled-path test. Persisted user preference, startup reconciliation and production consent UX remain separate future work.

Simulator/device checklist:

1. Open `Diagnóstico` in the debug gallery and confirm both controls are available.
2. Disable Analytics; the event probe must become disabled. Re-enable it and send exactly one QA probe.
3. Disable Crash Reporting; the non-fatal probe must become disabled. Re-enable it and record exactly one non-fatal.
4. Confirm the status text after every operation. A native failure must show `falhou`, not crash or freeze the app.
5. When Firebase console access is available, enable Analytics debug mode for the QA app and confirm `remus_qa_observability_probe` in DebugView.
6. Relaunch the app after recording the non-fatal, then confirm `REMUS QA non-fatal probe` in Crashlytics for the QA app; Firebase sends recorded non-fatals on the next launch.
7. Leave both channels enabled when finishing this temporary QA test.

## Tests

```sh
npm test -- --runInBand
npx tsc --noEmit
npm run lint
npm run firebase:verify
```

Build and run Android/iOS QA Debug, confirm `remus_app_started` in Analytics DebugView, then build QA Release and confirm it runs without Metro. After QA, validate both Production variants. The two previous QA smoke tests already proved Crashlytics nonfatal delivery and do not need to be repeated for this patch.

## Release JavaScript source maps

**Important limitation:** Firebase Crashlytics handles iOS native dSYMs and native Android symbols/mappings, **but it does not automatically consume React Native JS source maps for readable JavaScript stacks in its dashboard**. Keep these maps for manual symbolication, separate from dSYMs.

- Android Gradle React Native config explicitly sets `hermesFlags = ["-O", "-output-source-map"]`. After `:app:assembleQaRelease` / `:app:assembleProdRelease`, locate final composed sourcemaps using:
  ```sh
  find android/app/build -type f -name 'index.android.bundle.map'
  ```
  Common location is `android/app/build/generated/sourcemaps/react/qaRelease/index.android.bundle.map` (or `prodRelease`). Do not confuse the composed map with intermediate Metro/Hermes maps.
- iOS `Bundle React Native code and images` Xcode phase exports `SOURCEMAP_FILE` for `Release` and `Release QA` to `${CONFIGURATION_BUILD_DIR}/remus-source-maps/main.jsbundle.map`, which is **outside `.app`**. Locate it after a release build with:
  ```sh
  find "$HOME/Library/Developer/Xcode/DerivedData" /tmp -path '*/remus-source-maps/main.jsbundle.map' -type f 2>/dev/null
  ```
  A map generated in DerivedData may not survive an Xcode cleanup or be included in an `.xcarchive`.
- Preserve a **private copy** per exact distributed build (app ID, QA/Prod, platform, version, build number, commit SHA). Do not commit or ship these source maps as public files.
- For manual symbolication, save the *JS stack trace* as `stacktrace.txt`, then run:
  ```sh
  npx --no-install metro-symbolicate /path/to/corresponding.map < stacktrace.txt
  ```
  The map **must match the exact binary** that produced that error. A source map from a later build is not valid.

Reference: https://reactnative.dev/docs/debugging-release-builds
