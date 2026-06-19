#!/bin/bash

echo "[+] Downloading maintenance page"
sleep 2
wget -O maintenance.html https://raw.githubusercontent.com/haltman-io/maintenance-static-page/refs/heads/main/index.html

echo "[+] Uploading maintenance page to web directory"
sleep 2
sudo mv ./maintenance.html /var/www/mail-forwarding/current/index.html

echo "[+] DONE"