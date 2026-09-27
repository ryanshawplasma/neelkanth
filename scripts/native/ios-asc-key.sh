#!/usr/bin/env bash
# Writes the App Store Connect key where altool and xcodebuild look for it.
#
#   ASC_KEY_ID=<key id> ASC_PRIVATE_KEY="<.p8 contents>" ios-asc-key.sh
#
# Shared by .github/workflows/ios.yml and codemagic.yaml, so both machines
# sign with a key written the same way.
#
# The key is REBUILT from its base64 body rather than written as given. A
# secret pasted into a web form can come back with its line breaks turned into
# spaces, or as one base64 blob, and either way the file "looks" right while
# xcodebuild refuses it half an hour into the build. So: accept the .p8 as
# text or as base64, re-fold it at 64 columns, and prove it parses as a
# private key before anything expensive runs.
set -euo pipefail

fail() { echo "::error::$*" >&2; exit 1; }

[ -n "${ASC_KEY_ID:-}" ] || fail "ASC_KEY_ID is empty."
[ -n "${ASC_PRIVATE_KEY:-}" ] || fail "APPSTORE_PRIVATE_KEY is empty — paste the whole .p8 file."

RAW=$(printf '%s' "$ASC_PRIVATE_KEY" | tr -d '\r')
case "$RAW" in
  *"BEGIN PRIVATE KEY"*) ;;
  *) RAW=$(printf '%s' "$RAW" | tr -d ' \n\t' | base64 --decode 2>/dev/null | tr -d '\r' || true) ;;
esac
case "$RAW" in
  *"-----BEGIN PRIVATE KEY-----"*"-----END PRIVATE KEY-----"*) ;;
  *) fail "APPSTORE_PRIVATE_KEY is not the .p8 contents (no BEGIN/END PRIVATE KEY lines, as text or base64)." ;;
esac

BODY=$(printf '%s' "$RAW" \
  | sed -e 's/-----BEGIN PRIVATE KEY-----//' -e 's/-----END PRIVATE KEY-----//' \
  | tr -d ' \n\t')

# altool finds the key only under ~/.appstoreconnect/private_keys, by this
# exact file name; xcodebuild is given the path.
DIR="$HOME/.appstoreconnect/private_keys"
KEY="$DIR/AuthKey_${ASC_KEY_ID}.p8"
mkdir -p "$DIR"
{
  echo "-----BEGIN PRIVATE KEY-----"
  printf '%s\n' "$BODY" | fold -w 64
  echo "-----END PRIVATE KEY-----"
} > "$KEY"
chmod 600 "$KEY"

openssl pkey -in "$KEY" -noout > /dev/null 2>&1 \
  || { rm -f "$KEY"; fail "APPSTORE_PRIVATE_KEY does not parse as a private key — was part of the file left out?"; }
echo "App Store Connect key $ASC_KEY_ID written"
