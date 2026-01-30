#!/usr/bin/env bash
set -euo pipefail

WEB_ROOT="${WEB_ROOT:-/var/www/mail-forwarding}"
DEPLOY_GROUP="${DEPLOY_GROUP:-deploy}"

CADDY_USER="${CADDY_USER:-$(ps -o user= -C caddy 2>/dev/null | head -n1 | tr -d ' ' || true)}"
CADDY_USER="${CADDY_USER:-caddy}"

echo "[*] WEB_ROOT=$WEB_ROOT"
echo "[*] DEPLOY_GROUP=$DEPLOY_GROUP"
echo "[*] CADDY_USER=$CADDY_USER"

sudo groupadd -f "$DEPLOY_GROUP"

sudo usermod -aG "$DEPLOY_GROUP" "$USER"

if id "$CADDY_USER" >/dev/null 2>&1; then
  sudo usermod -aG "$DEPLOY_GROUP" "$CADDY_USER"
else
  echo "[!] user '$CADDY_USER' not found. Set CADDY_USER=... and rerun if needed."
fi

sudo mkdir -p "$WEB_ROOT/releases"

if [ ! -L "$WEB_ROOT/current" ]; then
  sudo ln -sfn "$WEB_ROOT/releases" "$WEB_ROOT/current" 2>/dev/null || true
fi

sudo chown -R root:"$DEPLOY_GROUP" "$WEB_ROOT"
sudo chmod -R 2775 "$WEB_ROOT"

echo
echo "[+] Bootstrap done."
echo "    IMPORTANT: logout/login (or 'newgrp $DEPLOY_GROUP') so your shell picks up group membership."
echo "    Recommended: set 'umask 002' in ~/.profile or ~/.bashrc for group-writable files."
