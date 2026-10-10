#!/bin/bash
# Builds "Branding Designer.app" and installs it to /Applications
# (falls back to ~/Applications). Re-run any time; it rebuilds and reinstalls.
#
# Env overrides (used for test builds):
#   BUNDLE_ID=...      bundle identifier      (default com.walkertracy.brandingdesigner)
#   INSTALL_DIR=...    where to install       (default /Applications, then ~/Applications)
#   SWIFT_FLAGS=...    extra swiftc flags     (e.g. "-D TESTHOOK")
set -euo pipefail

MAC_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$MAC_DIR")"
APP_NAME="Branding Designer"
BUNDLE_ID="${BUNDLE_ID:-com.walkertracy.brandingdesigner}"
BUILD_DIR="$MAC_DIR/build/stage"
APP="$BUILD_DIR/$APP_NAME.app"

echo "==> Cleaning"
rm -rf "$BUILD_DIR"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources/web"

echo "==> Compiling Swift (arm64, macOS 13+)"
swiftc -O -target arm64-apple-macos13.0 ${SWIFT_FLAGS:-} \
  -o "$APP/Contents/MacOS/BrandingDesigner" "$MAC_DIR/main.swift"

echo "==> Info.plist"
sed -e "s/@BUNDLE_ID@/$BUNDLE_ID/" -e "s/@BUILD@/$(date +%Y%m%d%H%M)/" \
  "$MAC_DIR/Info.plist" > "$APP/Contents/Info.plist"
printf 'APPL????' > "$APP/Contents/PkgInfo"

echo "==> Icon"
ICON_TMP="$BUILD_DIR/icon"
mkdir -p "$ICON_TMP/AppIcon.iconset"
swift "$MAC_DIR/make-icon.swift" "$ICON_TMP/icon-1024.png"
for s in 16 32 128 256 512; do
  sips -z $s $s "$ICON_TMP/icon-1024.png" --out "$ICON_TMP/AppIcon.iconset/icon_${s}x${s}.png" >/dev/null
  sips -z $((s*2)) $((s*2)) "$ICON_TMP/icon-1024.png" --out "$ICON_TMP/AppIcon.iconset/icon_${s}x${s}@2x.png" >/dev/null
done
iconutil -c icns "$ICON_TMP/AppIcon.iconset" -o "$APP/Contents/Resources/AppIcon.icns"

echo "==> Copying web files"
WEB="$APP/Contents/Resources/web"
cp "$ROOT/index.html" "$WEB/"
cp -R "$ROOT/css" "$ROOT/js" "$WEB/"
mkdir -p "$WEB/vendor"
cp "$MAC_DIR/vendor/"*.js "$WEB/vendor/"
# Point the CDN script tags at the vendored copies so export works offline.
sed -i '' \
  -e 's#https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js#vendor/html2canvas.min.js#' \
  -e 's#https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js#vendor/jspdf.umd.min.js#' \
  "$WEB/index.html"
if grep -q cdnjs "$WEB/index.html"; then echo "CDN reference left in index.html" >&2; exit 1; fi

echo "==> Codesign (ad-hoc)"
codesign --force --deep -s - "$APP"
codesign --verify --deep --strict "$APP"

echo "==> Installing"
DEST_DIR="${INSTALL_DIR:-/Applications}"
if [ ! -w "$DEST_DIR" ]; then
  DEST_DIR="$HOME/Applications"
  mkdir -p "$DEST_DIR"
fi
if pgrep -x BrandingDesigner >/dev/null 2>&1; then
  echo "    quitting running instance"
  osascript -e "tell application id \"$BUNDLE_ID\" to quit" >/dev/null 2>&1 || true
  for _ in $(seq 1 20); do
    pgrep -x BrandingDesigner >/dev/null 2>&1 || break
    sleep 0.25
  done
  pkill -x BrandingDesigner >/dev/null 2>&1 || true
fi
rm -rf "$DEST_DIR/$APP_NAME.app"
cp -R "$APP" "$DEST_DIR/$APP_NAME.app"
# Drop the intermediate bundle so Launch Services only knows the installed one.
rm -rf "$APP"
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$DEST_DIR/$APP_NAME.app" >/dev/null 2>&1 || true
touch "$DEST_DIR/$APP_NAME.app"
echo "==> Installed: $DEST_DIR/$APP_NAME.app"
