"use client";

import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { QRCodeSVG } from "qrcode.react";
import {
  Bitcoin,
  Check,
  Copy,
  ExternalLink,
  Fingerprint,
  Gem,
  Mail,
  QrCode,
  Zap,
} from "lucide-react";
import { DONATION_WALLETS, PIX_INFO } from "@/lib/donate-data";
import styles from "./donation.module.css";

const walletIcons = {
  xmr: Fingerprint,
  btc: Bitcoin,
  lightning: Zap,
  eth: Gem,
};

export function DonationWallets() {
  const [method, setMethod] = React.useState("xmr");
  const [copied, setCopied] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function selectMethod(value: string) {
    if (timer.current) clearTimeout(timer.current);
    setMethod(value);
    setCopied(null);
    setError(null);
  }
  async function copyAddress(id: string, address: string) {
    setError(null);
    try {
      await navigator.clipboard.writeText(address);
      if (timer.current) clearTimeout(timer.current);
      setCopied(id);
      timer.current = setTimeout(() => setCopied(null), 2400);
    } catch {
      setError("Couldn’t copy. You can select and copy the address above.");
    }
  }
  return (
    <Tabs.Root
      value={method}
      onValueChange={selectMethod}
      className={styles.walletPanel}
    >
      <Tabs.List aria-label="Donation method" className={styles.walletTabs}>
        {DONATION_WALLETS.map((wallet) => (
          <Tabs.Trigger
            key={wallet.id}
            value={wallet.id}
            aria-label={wallet.name}
            className={styles.walletTab}
          >
            {wallet.symbol}
          </Tabs.Trigger>
        ))}
        <Tabs.Trigger value="pix" className={styles.walletTab}>
          PIX
        </Tabs.Trigger>
      </Tabs.List>
      {DONATION_WALLETS.map((wallet) => {
        const Icon = walletIcons[wallet.id as keyof typeof walletIcons];
        return (
          <Tabs.Content
            key={wallet.id}
            value={wallet.id}
            className={styles.walletContent}
          >
            <div className={styles.walletTitle}>
              <Icon size={22} aria-hidden="true" />
              <div>
                <h3>{wallet.name}</h3>
                <p>{wallet.network}</p>
              </div>
            </div>
            <div className={styles.walletBody}>
              <div className={styles.walletDetails}>
                <p className={styles.addressLabel}>
                  {wallet.id === "lightning"
                    ? "Lightning address"
                    : "Wallet address"}
                </p>
                <code className={styles.walletAddress}>{wallet.address}</code>
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={() => void copyAddress(wallet.id, wallet.address)}
                >
                  {copied === wallet.id ? (
                    <Check size={15} aria-hidden="true" />
                  ) : (
                    <Copy size={15} aria-hidden="true" />
                  )}
                  {copied === wallet.id ? "Address copied" : "Copy address"}
                </button>
              </div>
              <div className={styles.qr}>
                <QRCodeSVG
                  value={wallet.address}
                  title={`QR code for the ${wallet.name} donation address`}
                  role="img"
                  size={128}
                  level="M"
                  marginSize={4}
                />
                <span>
                  <QrCode size={12} aria-hidden="true" /> Scan address
                </span>
              </div>
            </div>
            <p className={styles.walletNote}>{wallet.note}</p>
          </Tabs.Content>
        );
      })}
      <Tabs.Content
        value="pix"
        className={`${styles.walletContent} ${styles.pixContent}`}
      >
        <div className={styles.walletTitle}>
          <QrCode size={22} aria-hidden="true" />
          <div>
            <h3>PIX</h3>
            <p>For our friends in Brazil</p>
          </div>
        </div>
        <p>
          Para doar via PIX, fale com a gente por email ou Telegram. Enviamos os
          dados de pagamento por lá.
        </p>
        <a
          href={`mailto:${PIX_INFO.contactEmail}?subject=Doa%C3%A7%C3%A3o%20via%20PIX`}
          className={styles.copyButton}
        >
          <Mail size={15} aria-hidden="true" />
          {PIX_INFO.contactEmail}
        </a>
        <div className={styles.telegramLinks}>
          {PIX_INFO.telegramLinks.map((tg) => (
            <a key={tg.url} href={tg.url} target="_blank" rel="noreferrer">
              {tg.label}
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          ))}
        </div>
      </Tabs.Content>
      <div
        role="status"
        aria-live="polite"
        className={error ? styles.copyError : styles.srOnly}
      >
        {error || (copied ? "Donation address copied to clipboard." : "")}
      </div>
    </Tabs.Root>
  );
}
