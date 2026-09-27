#!/usr/bin/env bash
# Writes one app's GoogleService-Info.plist from $PLIST, and refuses the wrong
# one.
#
#   PLIST="<file contents>" ios-firebase-plist.sh <bundle id>
#
# Refusing a missing plist is the point of this script, not a nicety:
# @capacitor-firebase/messaging calls FirebaseApp.configure() as the bridge
# loads, and without the file that is a crash on launch, on a build that
# compiled and uploaded clean. And Firebase matches on bundle id, so the
# wrong app's file inside an app builds, launches, and registers every
# till for push as a guest's phone.
set -euo pipefail

WANT="$1"
DEST=ios/App/App/GoogleService-Info.plist

if [ -z "${PLIST:-}" ]; then
  echo "::error::No Firebase config for $WANT. Without GoogleService-Info.plist the app crashes on launch, so this build stops here." >&2
  exit 1
fi

# Taken as the file's text or as base64 of it: a web form's secret box is not
# promised to keep line breaks, and base64 is the usual way round that.
# Whitespace between XML tags does not matter, so flattened text still parses.
case "$(printf '%s' "$PLIST" | tr -d ' \n\r\t' | head -c 6)" in
  "<?xml"*|"<plist"*|"<!DOCT"*) ;;
  *) PLIST=$(printf '%s' "$PLIST" | tr -d ' \n\r\t' | base64 --decode 2>/dev/null) || {
       echo "::error::The Firebase config for $WANT is neither the plist file's text nor base64 of it." >&2
       exit 1
     } ;;
esac

printf '%s' "$PLIST" > "$DEST"
plutil -lint "$DEST" > /dev/null

GOT=$(plutil -extract BUNDLE_ID raw -o - "$DEST")
if [ "$GOT" != "$WANT" ]; then
  echo "::error::The Firebase config is for $GOT, not $WANT." >&2
  exit 1
fi
echo "Firebase config for $GOT"
