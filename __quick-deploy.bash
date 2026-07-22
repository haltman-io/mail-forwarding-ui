#!/usr/bin/env bash

set -Eeuo pipefail

REMOTE="origin"
BRANCH="main"
BUILD_DIR="./out"
DEPLOY_DIR="/var/www/mail-forwarding/current"

log() {
    printf '\n[+] %s\n' "$1"
}

error() {
    printf '\n[!] Falha na linha %s.\n' "$1" >&2
}

trap 'error "$LINENO"' ERR

log "Atualizando o repositório"
git fetch --prune "$REMOTE" "$BRANCH"
git reset --hard "$REMOTE/$BRANCH"

log "Instalando dependências"
if [[ -f package-lock.json ]]; then
    npm ci
else
    npm install
fi

log "Removendo build local anterior"
rm -rf -- "$BUILD_DIR"

log "Gerando nova build"
npm run build

if [[ ! -d "$BUILD_DIR" ]]; then
    echo "[!] O diretório de build não foi criado: $BUILD_DIR" >&2
    exit 1
fi

log "Limpando diretório publicado"
sudo mkdir -p "$DEPLOY_DIR"
sudo find "$DEPLOY_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +

log "Publicando nova build"
sudo cp -a "$BUILD_DIR/." "$DEPLOY_DIR/"

log "Deploy concluído com sucesso"