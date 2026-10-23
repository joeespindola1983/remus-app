# Remus observability — bootstrap

One Firebase project `remus-fc856` hosts separate QA and Production apps for Android and iOS.

## Application API

- `src/observability/telemetry.ts`: injectable business-facing interface. No Firebase imports.
- `src/observability/firebaseTelemetry.ts`: the only Firebase adapter.
- `index.js`: sends the custom Analytics event `remus_app_started` **once per JavaScript runtime startup**. Automatic lifecycle events remain available. This does not imply an event for every foreground/resume.
- For a future recoverable error: `void remusTelemetry.recordNonFatal(error)`. Do not put GPS positions, personal details, activity traces, or credentials in error messages.
- Both methods are best effort: Analytics / Crashlytics outages must not block a workout.
- The temporary Crashlytics QA button and activation script were removed.

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
