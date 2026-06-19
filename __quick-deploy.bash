#!/bin/bash

echo "[+] Running: npm run build"
sleep 2
npm run build

echo "[+] Running: sudo rm /var/www/mail-forwarding/current/*"
sleep 2
sudo rm /var/www/mail-forwarding/current/* -rf

echo "[+] Running: sudo mv ./out/* /var/www/mail-forwarding/current/."
sleep 2
sudo mv ./out/* /var/www/mail-forwarding/current/.

echo "[+] DONE"