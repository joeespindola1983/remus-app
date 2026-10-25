# Remus App

Mobile app for **Remus**, an Olympic rowing telemetry product. The initial development baseline is **0.0.1**.

## Project status

- React Native `0.88.0`, React `19.3.0`, TypeScript.
- Development is **QA-first**. The default `npm run android` and `npm run ios` commands target QA.
- Android and iOS QA Debug/Release builds were validated during the bootstrap, including Firebase Analytics, Crashlytics, and release JavaScript source maps.
- **Production builds, releases, and distribution are outside the current scope.** The native Production configurations exist, but are not being actively developed or homologated.

## Requirements

- Node.js `>=22.11.0`, npm and the React Native platform toolchain.
- For iOS: Xcode, Ruby/Bundler and CocoaPods.
- For Android: Android SDK, JDK, an Android emulator or a physical device.

## Local setup

```sh
npm ci
bundle install
cd ios && bundle exec pod install && cd ..
```

The project has separate Firebase client configuration files for QA and Production. Android QA builds also depend on a locally configured QA signing key. Set the `REMUS_QA_*` Gradle properties on your machine (for example in `~/.gradle/gradle.properties`), and keep the keystore and passwords **out of Git**. Do not commit private keys, Firebase service-account credentials or machine-specific settings.

## Run QA

```sh
npm start         # Metro (in a separate terminal for Debug)
npm run android   # Android QA Debug
npm run ios       # iOS QA Debug
```

## Validate

```sh
npm test -- --runInBand
npx tsc --noEmit
npm run lint
npm run firebase:verify
```

## Development workflow

The project uses a QA-first adaptation of GitFlow:

- `main`: reserved for the stable baseline and future Production releases.
- `develop`: integration branch for QA development.
- `feature/*`: short-lived development branches, created from `develop`.

The initial `v0.0.1` tag marks the **QA bootstrap baseline on `develop`**; it is **not** a Production release. See [docs/git-workflow.md](docs/git-workflow.md) for branch and tagging conventions.

Additional technical notes: [docs/observability.md](docs/observability.md).

Recording roadmap: [integration with Remus Recorder](docs/recording-integration-plan.md).
