#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/mail-forwarding-ui}"
WEB_ROOT="${WEB_ROOT:-/var/www/mail-forwarding}"
RELEASES="$WEB_ROOT/releases"
LOCK="$WEB_ROOT/.deploy.lock"

exec 9>"$LOCK"
if ! flock -n 9; then
  echo "[!] Another deploy is running. Exiting."
  exit 1
fi

cd "$APP_DIR"

echo "[*] Updating code..."
git fetch --all --prune
git reset --hard origin/main

SHA="$(git rev-parse --short HEAD)"
TS="$(date +%Y%m%d-%H%M%S)"
REL="$RELEASES/${TS}-${SHA}"

echo "[*] Building..."
npm ci
npm run build

npm run export 2>/dev/null || true

echo "[*] Creating release: $REL"
mkdir -p "$REL"

echo "[*] Syncing ./out -> release (rsync --delete)"
rsync -a --delete "./out/" "$REL/"

echo "[*] Switching current -> $REL"
ln -sfn "$REL" "$WEB_ROOT/current"

echo "[+] Deployed: $REL"
echo "[i] Current now points to: $(readlink -f "$WEB_ROOT/current")"
