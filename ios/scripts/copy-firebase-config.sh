#!/bin/sh
set -eu

case "${CONFIGURATION:-}" in
  "Debug QA"|"Release QA") firebase_environment="QA" ;;
  "Debug"|"Release") firebase_environment="Prod" ;;
  *) echo "error: Unknown iOS configuration: ${CONFIGURATION:-unset}" >&2; exit 1 ;;
esac

source_plist="${PROJECT_DIR}/Firebase/${firebase_environment}/GoogleService-Info.plist"
destination_plist="${TARGET_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/GoogleService-Info.plist"

if [ ! -f "$source_plist" ]; then
  echo "error: Missing Firebase config $source_plist" >&2
  exit 1
fi

mkdir -p "$(dirname "$destination_plist")"
cp "$source_plist" "$destination_plist"
echo "Remus Firebase configuration: ${firebase_environment} (${CONFIGURATION})"
