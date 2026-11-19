export interface CryptoWallet {
  id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  note: string;
}

export const DONATION_WALLETS: CryptoWallet[] = [
  {
    id: "xmr",
    name: "Monero",
    symbol: "XMR",
    network: "Monero network",
    address:
      "4AquJ1XAJvxNtGDtSGHEVcQUCHK8nENwHRAVFv3CoaZdKXiusSU5VgLUSTQtJLR2ApMGAdguijR92c8dT2KL1RGBGK5Wqu9",
    note: "Send XMR directly to this address. No payment processor in between.",
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin network · on-chain",
    address: "bc1qrq9ff66f2ss9addc89q4yfer6jta7kr8nnvht3",
    note: "For on-chain BTC donations. For Lightning, use the LN tab.",
  },
  {
    id: "lightning",
    name: "Bitcoin Lightning",
    symbol: "LN",
    network: "Lightning network",
    address: "abin@bipa.app",
    note: "Send from a wallet that supports Lightning addresses.",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    network: "Ethereum mainnet",
    address: "0x2FE8Ed59ECD6D79f645deD5d4a9fe24b7351243e",
    note: "Send ETH on Ethereum mainnet to the address above.",
  },
];

export const PIX_INFO = {
  contactEmail: "root@segfault.net",
  telegramLinks: [
    { label: "t.me/thcorg", url: "https://t.me/thcorg" },
    { label: "t.me/haltman_group", url: "https://t.me/haltman_group" },
  ],
};

export const SMTP_PERK_INFO = {
  host: "mail.abin.lat",
  port: 587,
  encryption: "STARTTLS",
  helo: "mail.abin.lat",
  repoUrl: "https://github.com/haltman-io/mail-forwarding-core",
  setupUrl: "/smtp-setup",
  contactEmail: "root@segfault.net",
};
