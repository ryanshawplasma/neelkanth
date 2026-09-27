#!/usr/bin/env bash
# Writes ios/App/ExportOptions.plist. Needs TEAM_ID.
#
# The same for both apps: automatic signing lets xcodebuild pick each bundle
# id's own App Store profile. manageAppVersionAndBuildNumber is off so App
# Store Connect keeps the numbers the build set instead of rewriting them.
set -euo pipefail

[ -n "${TEAM_ID:-}" ] || { echo "::error::TEAM_ID is empty." >&2; exit 1; }

cat > ios/App/ExportOptions.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>export</string>
  <key>teamID</key><string>${TEAM_ID}</string>
  <key>signingStyle</key><string>automatic</string>
  <key>uploadSymbols</key><true/>
  <key>manageAppVersionAndBuildNumber</key><false/>
</dict></plist>
EOF
echo "ExportOptions.plist for team $TEAM_ID"
