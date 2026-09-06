#!/usr/bin/env bash
# Derives the release icon from the debug one.
#
# resources/AppIconDev.icns is the source artwork: a white helm on a dark
# ground, which is what development builds keep so a debug app is never
# mistaken for the installed one. The release icon is the same artwork with
# the mark recolored to the product's own Red accent (theme.rs).
#
# Needs ImageMagick. Run after changing the source artwork.
set -euo pipefail

cd "$(dirname "$0")/.."

accent="#E5484D"
source_icon="resources/AppIconDev.icns"
target_icon="resources/AppIcon.icns"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

iconutil -c iconset -o "$work/red.iconset" "$source_icon"
for png in "$work/red.iconset"/*.png; do
  # The mark is the only bright thing on a dark ground, so its own luminance
  # is the mask. The level ramp keeps the antialiased edge pixels blended
  # rather than hard-clipping them into a jagged outline.
  magick "$png" \
    \( +clone -fill "$accent" -colorize 100% \) \
    \( "$png" -alpha off -colorspace gray -level 45%,75% \) \
    -compose over -composite "$png"
done
iconutil -c icns -o "$target_icon" "$work/red.iconset"
echo "wrote $target_icon"

# The site advertises the released build, so its icons come from the release
# artwork rather than the development one.
site="website/public"
magick "$work/red.iconset/icon_512x512.png" -resize 256x256 "$site/app-icon.png"
cp "$work/red.iconset/icon_512x512.png" "$site/og-icon.png"
magick "$work/red.iconset/icon_512x512.png" -resize 180x180 "$site/apple-touch-icon.png"
magick "$work/red.iconset/icon_512x512.png" -resize 32x32 "$site/favicon.png"
echo "wrote $site/{app-icon,og-icon,apple-touch-icon,favicon}.png"
