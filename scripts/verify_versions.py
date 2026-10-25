#!/usr/bin/env python3
"""Fail when npm, Android and iOS release versions diverge."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


package = json.loads((ROOT / "package.json").read_text())
package_lock = json.loads((ROOT / "package-lock.json").read_text())
version = package.get("version")

if not isinstance(version, str) or not re.fullmatch(r"0\.\d+\.\d+", version):
    fail(f"package.json version must use pre-release SemVer 0.x.y, found {version!r}")

lock_versions = {
    package_lock.get("version"),
    package_lock.get("packages", {}).get("", {}).get("version"),
}
if lock_versions != {version}:
    fail(f"package-lock.json versions {sorted(map(str, lock_versions))} do not match {version}")

android = (ROOT / "android/app/build.gradle").read_text()
android_names = re.findall(r'^\s*versionName\s+"([^"]+)"', android, re.MULTILINE)
android_codes = re.findall(r"^\s*versionCode\s+(\d+)", android, re.MULTILINE)
if android_names != [version]:
    fail(f"Android versionName must be {version}, found {android_names}")
if len(android_codes) != 1:
    fail(f"expected one Android versionCode, found {android_codes}")

xcode = (ROOT / "ios/RemusApp.xcodeproj/project.pbxproj").read_text()
ios_versions = re.findall(r"^\s*MARKETING_VERSION = ([^;]+);", xcode, re.MULTILINE)
ios_builds = re.findall(r"^\s*CURRENT_PROJECT_VERSION = ([^;]+);", xcode, re.MULTILINE)
if len(ios_versions) != 4 or set(ios_versions) != {version}:
    fail(f"all four iOS MARKETING_VERSION values must be {version}, found {ios_versions}")
if len(ios_builds) != 4 or len(set(ios_builds)) != 1:
    fail(f"all four iOS CURRENT_PROJECT_VERSION values must match, found {ios_builds}")

build = android_codes[0]
if set(ios_builds) != {build}:
    fail(f"Android versionCode {build} does not match iOS build values {ios_builds}")
if int(build) <= 0:
    fail("native build number must be positive")

info_plist = (ROOT / "ios/RemusApp/Info.plist").read_text()
if "$(MARKETING_VERSION)" not in info_plist or "$(CURRENT_PROJECT_VERSION)" not in info_plist:
    fail("Info.plist must derive its version and build from Xcode build settings")

print(f"OK version {version} build {build}: npm, Android and all iOS configurations match.")
