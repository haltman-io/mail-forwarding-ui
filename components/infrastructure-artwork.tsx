import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "./donation.module.css";

// Free two-tone Cloud drawing by Overflow Design, recoloured for the public theme.
// Source and licence: public/illustrations/NOTICE.txt
export function InfrastructureArtwork({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn(styles.artwork, className)} aria-hidden="true">
      <Image
        className={styles.lightArtwork}
        src="/illustrations/mail-infrastructure-light.svg"
        alt=""
        width={240}
        height={240}
        priority={priority}
      />
      <Image
        className={styles.darkArtwork}
        src="/illustrations/mail-infrastructure-dark.svg"
        alt=""
        width={240}
        height={240}
        priority={priority}
      />
    </div>
  );
}
