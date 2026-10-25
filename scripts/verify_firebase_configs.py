#!/usr/bin/env python3
"""Check the Firebase files matched to each Remus build environment."""

from pathlib import Path
import json
import plistlib
import sys

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
    "qa": "com.espindola.remus.app.qa",
    "prod": "com.espindola.remus.app",
}


def validate() -> int:
    project_ids = set()
    for env, package_id in EXPECTED.items():
        android_path = ROOT / "android/app/src" / env / "google-services.json"
        ios_env = "QA" if env == "qa" else "Prod"
        ios_path = ROOT / "ios/Firebase" / ios_env / "GoogleService-Info.plist"
        android = json.loads(android_path.read_text())
        with ios_path.open("rb") as stream:
            ios = plistlib.load(stream)
        packages = [
            client["client_info"]["android_client_info"]["package_name"]
            for client in android["client"]
        ]
        if package_id not in packages:
            print(f"FAIL {env}: Android package {package_id} not found: {packages}")
            return 1
        if ios["BUNDLE_ID"] != package_id:
            print(f"FAIL {env}: iOS bundle ID {ios['BUNDLE_ID']} != {package_id}")
            return 1
        project_ids.add(android["project_info"]["project_id"])
        project_ids.add(ios["PROJECT_ID"])
        print(f"OK {env}: {package_id} (Firebase project {ios['PROJECT_ID']})")

    pbx = (ROOT / "ios/RemusApp.xcodeproj/project.pbxproj").read_text()
    for env, bundle_id in EXPECTED.items():
        if pbx.count(f"PRODUCT_BUNDLE_IDENTIFIER = {bundle_id};") != 2:
            print(f"FAIL iOS Xcode: expected two build configurations for {env}")
            return 1
    if len(project_ids) == 1:
        print("WARNING: QA and Production use the SAME Firebase project; data is not project-isolated.")
    elif len(project_ids) != 2:
        print(f"WARNING: unexpected Firebase project count: {sorted(project_ids)}")
    print("Firebase configuration files validated. Native builds still require on-device testing.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(validate())
    except (OSError, KeyError, ValueError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        sys.exit(1)
