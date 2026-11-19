import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Globe,
  KeyRound,
  Mail,
  Send,
  Server,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { InfrastructureArtwork } from "@/components/infrastructure-artwork";
import { DonationWallets } from "@/components/donation-wallets";
import { SMTP_PERK_INFO } from "@/lib/donate-data";
import styles from "@/components/donation.module.css";

export const metadata: Metadata = {
  title: "Donate · Free Mail Forwarding",
  description:
    "Help keep free, unlimited email forwarding running. Donate via Monero, Bitcoin, Lightning, Ethereum or PIX.",
  alternates: { canonical: "https://forward.haltman.io/donate" },
};

export default function DonatePage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={14} aria-hidden="true" /> Back to home
        </Link>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Built for everyone. Backed by you.</p>
            <h1>
              Free mail.
              <br />
              <span>Real bills.</span>
            </h1>
            <p className={styles.heroDescription}>
              Servers and domains cost money. If this project is useful to you,
              help keep it running.
            </p>
            <a href="#donate" className={styles.primaryButton}>
              Chip in <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <InfrastructureArtwork className={styles.heroArtwork} priority />
        </header>
        <div className={styles.projectNote}>
          <p>
            Free since day one. No account required, an open API, unlimited
            aliases. We built this because we believe tools like this should
            exist.
          </p>
          <p>
            We pay the bills out of pocket. Your donation helps cover domains
            and mail servers, so we can keep this service free for as long as we
            can afford to run it.
          </p>
        </div>
        <section
          id="donate"
          className={styles.donationSection}
          aria-labelledby="donate-title"
        >
          <div className={styles.sectionIntro}>
            <h2 id="donate-title">Keep it running.</h2>
            <p>
              Any amount is appreciated. Choose a method and send directly to
              our wallet.
            </p>
            <div className={styles.costs}>
              <span>
                <Server size={15} aria-hidden="true" /> Mail servers & hosting
              </span>
              <span>
                <Globe size={15} aria-hidden="true" /> Domain renewals
              </span>
            </div>
            <p className={styles.smallNote}>
              Prefer PIX? Choose the PIX tab to get in touch.
            </p>
          </div>
          <DonationWallets />
        </section>
        <section
          id="smtp"
          className={styles.smtpSection}
          aria-labelledby="smtp-title"
        >
          <div className={styles.smtpHeading}>
            <span className={styles.smtpIcon}>
              <Send size={21} aria-hidden="true" />
            </span>
            <div>
              <p className={styles.eyebrow}>For approved supporters</p>
              <h2 id="smtp-title">Your aliases can send, too.</h2>
            </div>
          </div>
          <div className={styles.smtpGrid}>
            <div className={styles.smtpDescription}>
              <p>
                Support the project and request outbound SMTP access. Send mail
                from your aliases and handles using your own mail client or
                scripts.
              </p>
              <p>
                Handles can send from any available project domain. It runs on
                Dovecot submission, the same infrastructure we use for
                activation emails.
              </p>
              <p className={styles.approvalNote}>
                Access is reviewed individually for supporters helping cover
                running costs. A donation does not automatically activate SMTP.
              </p>
              <a
                className={styles.textLink}
                href={`mailto:${SMTP_PERK_INFO.contactEmail}?subject=${encodeURIComponent("[Donation] SMTP access request")}`}
              >
                Request SMTP access <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
            <div className={styles.connection}>
              <div className={styles.connectionHeader}>
                <Server size={15} aria-hidden="true" />
                <span>SMTP / submission</span>
              </div>
              <dl>
                <div>
                  <dt>Host</dt>
                  <dd>{SMTP_PERK_INFO.host}</dd>
                </div>
                <div>
                  <dt>Port</dt>
                  <dd>
                    {SMTP_PERK_INFO.port}{" "}
                    <span>/ {SMTP_PERK_INFO.encryption}</span>
                  </dd>
                </div>
                <div>
                  <dt>HELO</dt>
                  <dd>{SMTP_PERK_INFO.helo}</dd>
                </div>
              </dl>
              <p>
                Multiple servers may be in the pool. Use the HELO hostname above
                when checking the connection.
              </p>
              <a
                href={SMTP_PERK_INFO.repoUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.sourceLink}
              >
                Inspect the infrastructure{" "}
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className={styles.setupFlow}>
            <h3>
              You choose the credentials.
              <br />
              We don’t need your password.
            </h3>
            <ol>
              <li>
                <Mail size={17} aria-hidden="true" />
                <div>
                  <strong>Send your donation details</strong>
                  <p>
                    Email{" "}
                    <a href={`mailto:${SMTP_PERK_INFO.contactEmail}`}>
                      {SMTP_PERK_INFO.contactEmail}
                    </a>{" "}
                    with your transaction reference and the aliases or handle
                    you want to send from.
                  </p>
                </div>
              </li>
              <li>
                <KeyRound size={17} aria-hidden="true" />
                <div>
                  <strong>Get an invitation</strong>
                  <p>
                    Once approved, you’ll receive a time-limited setup link from{" "}
                    {SMTP_PERK_INFO.contactEmail} to create your SMTP
                    credentials.
                  </p>
                </div>
              </li>
              <li>
                <ShieldCheck size={17} aria-hidden="true" />
                <div>
                  <strong>Set it up yourself</strong>
                  <p>
                    Choose your username, create your password, and select your
                    allowed sender addresses (ACLs) in the{" "}
                    <Link href={SMTP_PERK_INFO.setupUrl}>setup portal</Link>.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>
        <footer className={styles.footer}>
          <p>
            Use it. Share it. Help out if you can.
            <br />
            <span>Thanks for keeping this corner of the internet alive.</span>
          </p>
          <Link href="/console" className={styles.textLink}>
            Create an alias <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </footer>
      </main>
    </>
  );
}
