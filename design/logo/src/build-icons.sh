#!/bin/bash
# Build every production icon from the SVG masters and install into the repo.
set -euo pipefail
SP="$(cd "$(dirname "$0")" && pwd)"
R=/Users/vasuverma/Programming/helm
cd "$SP"

# --- full-bleed square for mobile (iOS masks its own corners, needs no alpha) --
python3 - <<'PY'
import re, os
src = open("icon-release.svg").read()
inner = re.search(r'<svg[^>]*>(.*)</svg>', src, re.S).group(1)
# drop the squircle paths + hairline, keep defs and the mark group
defs = re.search(r'<defs>.*?</defs>', inner, re.S).group(0)
markg = re.search(r'(<g transform="translate.*</g>)\s*$', inner, re.S).group(1)
out = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" '
       f'width="1024" height="1024">{defs}'
       '<rect x="0" y="0" width="1024" height="1024" fill="url(#bg)"/>'
       f'{markg}</svg>')
open("icon-fullbleed.svg", "w").write(out)
print("fullbleed ok")
PY

render () { rsvg-convert -w "$2" -h "$2" "$1" -o "$3"; }

# ---------------------------------------------------------------- macOS ----
for pair in "release:AppIcon" "debug:AppIconDev"; do
  variant="${pair%%:*}"; outname="${pair##*:}"
  set="$SP/$outname.iconset"; rm -rf "$set"; mkdir -p "$set"
  for s in 16 32 128 256 512; do
    render "icon-$variant.svg" "$s"           "$set/icon_${s}x${s}.png"
    render "icon-$variant.svg" "$((s * 2))"   "$set/icon_${s}x${s}@2x.png"
  done
  iconutil -c icns "$set" -o "$SP/$outname.icns"
  cp "$SP/$outname.icns" "$R/resources/$outname.icns"
  echo "macOS  -> resources/$outname.icns"
done

# -------------------------------------------------------------- Windows ----
for s in 16 32 48 64 128 256; do render icon-release.svg "$s" "ico-$s.png"; done
magick ico-16.png ico-32.png ico-48.png ico-64.png ico-128.png ico-256.png \
  "$R/resources/windows/AppIcon.ico"
echo "Windows -> resources/windows/AppIcon.ico"

# ------------------------------------------------- website (+ Linux icon) ---
render icon-release.svg 32  "$R/website/public/favicon.png"
render icon-release.svg 180 "$R/website/public/apple-touch-icon.png"
render icon-release.svg 512 "$R/website/public/og-icon.png"
render icon-release.svg 256 "$R/website/public/app-icon.png"
echo "web     -> favicon / apple-touch / og / app-icon (app-icon also feeds Linux)"

# ---------------------------------------------------------------- mobile ----
render icon-fullbleed.svg 512 "$R/apps/mobile/assets/images/icon.png"
render icon-fullbleed.svg 48  "$R/apps/mobile/assets/images/favicon.png"
# iOS forbids alpha on the app icon
magick "$R/apps/mobile/assets/images/icon.png" -background '#141417' -alpha remove -alpha off \
  "$R/apps/mobile/assets/images/icon.png"
# splash sits on #1a1a1a, so ship the bare white mark with transparency
rsvg-convert -w 512 -h 512 m6-mark-white.svg -o "$R/apps/mobile/assets/images/splash-icon.png"
echo "mobile  -> icon / favicon / splash-icon"
