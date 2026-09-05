#!/usr/bin/env bash

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

target_dir="${CARGO_TARGET_DIR:-target}"
version="$(cargo metadata --no-deps --format-version 1 | sed -n 's/.*"name":"helm","version":"\([^"]*\)".*/\1/p')"
target_triple="$(rustc -vV | sed -n 's/^host: //p')"
package="helm-${version}-${target_triple}"
archive="$target_dir/release/$package.tar.gz"
staging="$(mktemp -d)"
trap 'rm -rf -- "$staging"' EXIT

cargo build --locked --release \
  --package helm --bin helm --bin helm-updater \
  --package helm-daemon --bin helm-daemon

package_dir="$staging/$package"
install -Dm755 "$target_dir/release/helm" "$package_dir/bin/helm"
install -Dm755 "$target_dir/release/helm-updater" "$package_dir/bin/helm-updater"
install -Dm755 "$target_dir/release/helm-daemon" "$package_dir/bin/helm-daemon"
install -Dm644 resources/linux/io.github.vverma022.helm.desktop \
  "$package_dir/share/applications/io.github.vverma022.helm.desktop"
install -Dm644 resources/linux/self-update-v1 \
  "$package_dir/share/helm/self-update-v1"
install -Dm644 website/public/app-icon.png \
  "$package_dir/share/icons/hicolor/256x256/apps/io.github.vverma022.helm.png"
install -Dm644 LICENSE "$package_dir/share/licenses/helm/LICENSE"

mkdir -p "$(dirname "$archive")"
tar -C "$staging" -czf "$archive" "$package"
printf 'Created %s\n' "$archive"
