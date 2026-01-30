#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/mail-forwarding-ui}"
WEB_ROOT="${WEB_ROOT:-/var/www/mail-forwarding}"
RELEASES="${RELEASES:-$WEB_ROOT/releases}"
CURRENT_LINK="${CURRENT_LINK:-$WEB_ROOT/current}"
LOCK="${LOCK:-$WEB_ROOT/.deploy.lock}"
BRANCH="${BRANCH:-main}"

# ---- deps
command -v flock >/dev/null 2>&1 || { echo "[!] missing: flock (util-linux)"; exit 1; }
command -v rsync >/dev/null 2>&1 || { echo "[!] missing: rsync"; exit 1; }
command -v git   >/dev/null 2>&1 || { echo "[!] missing: git"; exit 1; }
command -v npm   >/dev/null 2>&1 || { echo "[!] missing: npm"; exit 1; }

# ---- lock (avoid concurrent deploy)
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "[!] Another deploy is running. Exiting."
  exit 1
fi

cd "$APP_DIR"

echo "[*] Updating code..."
git fetch --all --prune
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

SHA="$(git rev-parse --short HEAD)"
TS="$(date +%Y%m%d-%H%M%S)"
REL="$RELEASES/${TS}-${SHA}"

echo "[*] Building..."
# evita out velho influenciar deploy
npm run clean >/dev/null 2>&1 || true
npm ci
npm run build

# sanity check: out must exist
if [ ! -d "./out" ]; then
  echo "[!] build finished but ./out was not found. Aborting (current unchanged)."
  exit 1
fi

echo "[*] Creating release: $REL"
mkdir -p "$REL"

echo "[*] Syncing ./out -> release (rsync --delete)"
rsync -a --delete "./out/" "$REL/"

echo "[*] Switching current -> $REL"
ln -sfn "$REL" "$CURRENT_LINK"

echo "[+] Deployed: $REL"
echo "[i] Current now points to: $(readlink -f "$CURRENT_LINK")"
