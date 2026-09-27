#!/usr/bin/env bash
# Reads the exported .ipa and checks it is the app it claims to be. Run from
# ios/App. Adapted from ryanshawplasma/dino's ios-verify.sh, where every check
# below is something that built, uploaded and passed review while broken.
#
#   ios-verify.sh <bundle id> <display name> <start url>
#
# None of these turn xcodebuild red, so they are read out of the product.
set -euo pipefail

WANT_ID="$1"; WANT_NAME="$2"; WANT_URL="$3"
IPA="build/app-export/App.ipa"
WORK="build/app-verify"
rm -rf "$WORK"; mkdir -p "$WORK"
unzip -q "$IPA" -d "$WORK"
BUNDLE="$WORK/Payload/App.app"
PLIST="$BUNDLE/Info.plist"

fail() { echo "::error::$*" >&2; exit 1; }
get() { plutil -extract "$1" raw -o - "$2" 2>/dev/null || true; }
expect() { [ "$2" = "$3" ] || fail "$1 is '$2', expected '$3'"; echo "ok  $1 = $2"; }

expect CFBundleIdentifier "$(get CFBundleIdentifier "$PLIST")" "$WANT_ID"
expect CFBundleDisplayName "$(get CFBundleDisplayName "$PLIST")" "$WANT_NAME"
expect CFBundleShortVersionString "$(get CFBundleShortVersionString "$PLIST")" "$APP_VERSION_NAME"
expect CFBundleVersion "$(get CFBundleVersion "$PLIST")" "$BUILD_NUMBER"
expect ITSAppUsesNonExemptEncryption "$(get ITSAppUsesNonExemptEncryption "$PLIST")" "false"
expect UIDeviceFamily "$(plutil -extract UIDeviceFamily json -o - "$PLIST")" "[1]"

# The site takes photos for uploads (KYC, profile). iOS kills the app the first
# time a page asks for the camera without this sentence.
for key in NSCameraUsageDescription NSPhotoLibraryUsageDescription; do
  [ -n "$(get "$key" "$PLIST")" ] || fail "$key is missing — iOS kills the app when it asks"
  echo "ok  $key present"
done

[ -f "$BUNDLE/PrivacyInfo.xcprivacy" ] || fail "PrivacyInfo.xcprivacy is not inside the app"
plutil -lint "$BUNDLE/PrivacyInfo.xcprivacy" > /dev/null
echo "ok  PrivacyInfo.xcprivacy inside the app"

expect "GoogleService-Info BUNDLE_ID" "$(get BUNDLE_ID "$BUNDLE/GoogleService-Info.plist")" "$WANT_ID"

CAP="$BUNDLE/capacitor.config.json"
expect "server.url" "$(node -e "console.log(require('./$CAP').server.url)")" "$WANT_URL"
UA=$(node -e "console.log(require('./$CAP').appendUserAgent)")
case "$UA" in *"DivyaDhamApp/$APP_VERSION_NAME"*) ;; *) fail "user agent '$UA' does not carry DivyaDhamApp/$APP_VERSION_NAME";; esac
echo "ok  user agent $UA"

# The entitlements the signature carries, not the file in the repo. Without
# aps-environment=production no push token is ever issued on a store install.
codesign -d --entitlements - --xml "$BUNDLE" > "$WORK/entitlements.plist" 2>/dev/null
expect aps-environment "$(get aps-environment "$WORK/entitlements.plist")" "production"
expect application-identifier "$(get application-identifier "$WORK/entitlements.plist")" "$TEAM_ID.$WANT_ID"

echo "every check passed"
