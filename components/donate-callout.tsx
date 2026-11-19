import Link from "next/link";
import { ArrowRight, Heart, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfrastructureArtwork } from "@/components/infrastructure-artwork";
import styles from "./donation.module.css";

interface DonateCalloutProps {
  className?: string;
  variant?: "banner" | "compact";
}

export function DonateCallout({
  className,
  variant = "banner",
}: DonateCalloutProps) {
  const compact = variant === "compact";
  return (
    <aside
      data-donate-banner
      aria-label="Support the project"
      className={cn(styles.callout, compact && styles.compact, className)}
    >
      {!compact && <InfrastructureArtwork className={styles.calloutArtwork} />}
      <div className={styles.calloutCopy}>
        <h2>
          {compact
            ? "Free mail. Kept alive by people like you."
            : "Free mail. Real bills."}
        </h2>
        <p>
          {compact
            ? "Help cover the servers and domains. Any amount is appreciated."
            : "No accounts, no limits, no one selling your data. Help us keep it that way."}
        </p>
        <Link href="/donate#smtp" className={styles.perkLink}>
          <Send size={13} aria-hidden="true" />
          <span>SMTP sending for approved supporters</span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
      <Link href="/donate" className={styles.supportLink}>
        <Heart size={15} aria-hidden="true" />
        <span>Keep it running</span>
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </aside>
  );
}
