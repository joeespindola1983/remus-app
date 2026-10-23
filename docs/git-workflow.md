# Remus App — Git workflow

## Current scope

This repository follows a **QA-first adaptation of GitFlow**. All development and validation happens in QA. Production / distribution / Release workflows will be defined when the product is ready. A Git tag does **not** publish an app or trigger a release by itself.

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Stable repository baseline; keep unchanged during QA feature development |
| `develop` | Integration of QA-tested work |
| `feature/<topic>` | Small, isolated changes branched from `develop` |
| `fix/<topic>` | Non-urgent QA fixes branched from `develop` |

For the initial setup, use `feature/bootstrap` and integrate it into `develop`. Tag `develop` as `v0.0.1` after validation; do not merge into `main` or create a GitHub Release for the QA milestone.

## Feature workflow

```sh
git switch develop
git pull --ff-only origin develop
git switch -c feature/my-feature

# Implement and validate using TDD.
npm test -- --runInBand
npx tsc --noEmit
npm run lint
npm run firebase:verify

git add -A
git diff --cached --check
git diff --cached --name-only   # Review before committing.
git commit -m "feat: describe change"

git switch develop
git merge --no-ff feature/my-feature
git push origin develop
# After merge and review: git branch -d feature/my-feature
```

## Versioning

- The initial `package.json` and `package-lock.json` version is `0.0.1`.
- `v0.0.1` is a **Git annotated tag on `develop`** describing the completed QA bootstrap, not a Production release.
- Future code increments use SemVer (`0.0.x` while the app is pre-release). Update npm manifests together when changing versions.
- Preserve build-specific source maps externally when they are used for error diagnosis; do not version generated build directories.

## Commit conventions

Use concise conventional messages, e.g. `chore: bootstrap QA app`, `feat: add session list`, `fix: prevent GPS timeout`, `test: cover recording state`, `docs: update bootstrap guide`.

## Repository safety

Do not commit keystores, `.jks`, `.env`, signing secrets, `~/.gradle/gradle.properties`, iOS provisioning private material, Firebase Admin SDK JSON, device-specific local config, generated builds, `node_modules`, `Pods` or Ruby vendor bundles. Firebase **client** configuration files (`google-services.json` and `GoogleService-Info.plist`) are part of the native app configuration and are expected to be embedded in client builds; they are not service-account credentials.

Before committing, always check `git status` and `git diff --cached --name-only`. If a sensitive path appears, stop and unstage it.
