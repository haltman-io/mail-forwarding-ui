#!/usr/bin/env bash
set -euo pipefail

WEB_ROOT="${WEB_ROOT:-/var/www/mail-forwarding}"
RELEASES="$WEB_ROOT/releases"

if [ "${1:-}" = "" ]; then
  echo "Usage:"
  echo "  $0 list"
  echo "  $0 <release-folder-name>"
  echo
  echo "Examples:"
  echo "  $0 list"
  echo "  $0 20260129-142000-ab12cd3"
  exit 1
fi

if [ "$1" = "list" ]; then
  echo "[*] Last 20 releases:"
  ls -1 "$RELEASES" | tail -n 20
  exit 0
fi

TARGET="$RELEASES/$1"

if [ ! -d "$TARGET" ]; then
  echo "[!] Release not found: $TARGET"
  exit 1
fi

ln -sfn "$TARGET" "$WEB_ROOT/current"
echo "[+] Rolled back to: $TARGET"
echo "[i] Current now points to: $(readlink -f "$WEB_ROOT/current")"
