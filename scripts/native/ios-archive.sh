#!/usr/bin/env bash
# Archives one app and exports its App Store .ipa. Run from ios/App.
#
#   ios-archive.sh   (DivyaDham is one app; adapted from ryanshawplasma/dino)
#
# Needs TEAM_ID, APP_VERSION_NAME, BUILD_NUMBER, ASC_KEY_PATH, ASC_KEY_ID and
# ASC_ISSUER_ID from the workflow.
#
# Signing happens in two halves, the way Xcode Cloud does it, because a build
# machine is new every time and owns no certificate:
#
#   archive — signed AD-HOC (CODE_SIGN_IDENTITY=-). That needs no certificate,
#             no provisioning profile and no registered device, and the
#             signature still carries the entitlements (push) for the export
#             to keep. Plain automatic signing here does not work: it signs for
#             DEVELOPMENT first, and a development profile must list a device
#             — "Your team has no devices from which to generate a provisioning
#             profile" (Codemagic, 23 Sep 2026) — and every fresh machine mints
#             a new development certificate doing it.
#   export  — -allowProvisioningUpdates with the API key: Apple makes the App
#             Store profile (no devices) and signs with a cloud-managed
#             distribution certificate, so no private key ever lives here.
#
# The recipe is Xcode Cloud's own, via Apple DTS:
# https://developer.apple.com/forums/thread/756119 . If the export fails with
# "Cloud signing permission error", the API key's role may not use cloud
# signing — make a Team Key with the Admin role and replace APPSTORE_*.
set -euo pipefail

APP=app
EXTRA=()

AUTH=(
  -allowProvisioningUpdates
  -authenticationKeyPath "$ASC_KEY_PATH"
  -authenticationKeyID "$ASC_KEY_ID"
  -authenticationKeyIssuerID "$ASC_ISSUER_ID"
)

# The `App` scheme is committed (xcshareddata/xcschemes/App.xcscheme) so a
# fresh checkout has one. Keep it byte-for-byte as Xcode writes it, because
# Xcode does not reject a scheme it cannot read — it quietly makes its own.
#
# The first two Codemagic archives (23 Sep 2026) failed with "Scheme App is
# not currently configured for the archive action". The file had been written
# by hand with `BuildableState = "buildable"` where Xcode writes
# `BuildableIdentifier = "primary"`, so none of its references resolved to the
# App target: Xcode logged "Supported platforms for the buildables in the
# current scheme is empty", invented a second scheme also called App, and
# `-scheme App` picked the empty one. (A first guess — the XML comment the
# file carried — was removed and the archive failed identically, so it was
# not that.) The listing below is what found it; it stays, and says so if
# two schemes of that name ever come back.
LIST=$(xcodebuild -list -project App.xcodeproj)
printf '%s\n' "$LIST"
APP_SCHEMES=$(printf '%s\n' "$LIST" | awk '/Schemes:/ { s = 1; next } s && /^[[:space:]]+App[[:space:]]*$/ { n++ } END { print n + 0 }')
if [ "$APP_SCHEMES" != 1 ]; then
  echo "::warning::xcodebuild sees $APP_SCHEMES schemes named App, expected 1 — Xcode could not match App.xcscheme to the App target and made its own. Compare its BuildableReference with what Xcode writes." >&2
fi

# `${EXTRA[@]+...}` rather than "${EXTRA[@]}": macOS still ships bash 3.2,
# where an empty array under `set -u` is an "unbound variable" and the
# customer archive would die before it started.
xcodebuild archive \
  -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "build/$APP.xcarchive" \
  ${EXTRA[@]+"${EXTRA[@]}"} \
  CODE_SIGN_STYLE=Automatic \
  CODE_SIGN_IDENTITY=- \
  AD_HOC_CODE_SIGNING_ALLOWED=YES \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  MARKETING_VERSION="$APP_VERSION_NAME" \
  CURRENT_PROJECT_VERSION="$BUILD_NUMBER"

# What the archive's ad-hoc signature carries — the export can only keep what
# is here, so a push entitlement missing at the end is traced to this line or
# past it. Printed, not checked: ios-verify.sh checks the finished .ipa.
codesign -d --entitlements - --xml "build/$APP.xcarchive/Products/Applications/App.app" 2>/dev/null \
  | plutil -convert json -o - - 2>/dev/null \
  || echo "(could not read the archive's entitlements)"
echo

# When cloud signing refuses, xcodebuild prints only "Cloud signing
# permission error" and "No profiles for '<id>' were found" — the same pair
# for an unaccepted agreement, a key whose role is too small, or a missing
# app record. The real reason is written only into the .xcdistributionlogs
# bundle whose path it prints, which the build machine then throws away
# (build 5 on 23 Sep stopped at exactly that pair). So on failure, print it.
set +e
xcodebuild -exportArchive \
  -archivePath "build/$APP.xcarchive" \
  -exportPath "build/$APP-export" \
  -exportOptionsPlist ExportOptions.plist \
  "${AUTH[@]}" 2>&1 | tee "build/$APP-export.log"
STATUS=${PIPESTATUS[0]}
set -e
if [ "$STATUS" != 0 ]; then
  LOGS=$(grep -oE '/[^"]+\.xcdistributionlogs' "build/$APP-export.log" | tail -1 || true)
  if [ -n "$LOGS" ] && [ -d "$LOGS" ]; then
    for f in "$LOGS"/IDEDistribution.critical.log "$LOGS"/IDEDistribution.standard.log; do
      [ -f "$f" ] || continue
      echo "---- $(basename "$f"): the lines that say why"
      grep -iE 'error|fail|agreement|permission|forbidden|denied|role|not allowed|required|expired' "$f" | tail -40 || true
      echo "---- $(basename "$f"): last lines"
      tail -25 "$f"
    done
    # Build 6 printed both of those and neither held the reason — Apple's
    # answer to the signing request is only in the verbose log. Tokens are
    # dropped before anything is printed.
    f="$LOGS/IDEDistribution.verbose.log"
    if [ -f "$f" ]; then
      echo "---- IDEDistribution.verbose.log: Apple's side of the signing request"
      grep -iE 'permission|forbidden|agreement|not allowed|cloud|certificate|role|status ?code|\b40[0-9]\b|error|denied|expired|required' "$f" \
        | grep -viE 'authorization|bearer|eyJ[A-Za-z0-9_-]{10,}' \
        | cut -c1-400 | tail -60 || true
    fi
  else
    echo "(xcodebuild named no distribution log bundle, or it is gone)"
  fi
  exit "$STATUS"
fi

ls -l "build/$APP-export"
