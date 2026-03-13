import { Suspense } from "react";

import { AuthFormCopy } from "@/components/auth-form-copy";
import styles from "@/components/auth-form-copy.module.css";

export default function LoginCopyPage() {
  return (
    <main className={`${styles.snapshotRoot} flex min-h-svh items-center justify-center px-6 py-10 md:px-10`}>
      <div className="relative w-full max-w-[460px]">
        <div className={`${styles.pageGlow} pointer-events-none absolute inset-x-8 top-4 h-24 rounded-full`} />
        <Suspense fallback={<LoginCopyFormFallback />}>
          <AuthFormCopy />
        </Suspense>
      </div>
    </main>
  );
}

function LoginCopyFormFallback() {
  return (
    <div className={`${styles.snapshotRoot} ${styles.panel} ${styles.accentBar} relative overflow-hidden rounded-[30px] p-6`}>
      <div className="relative space-y-5">
        <div className={`${styles.skeleton} h-6 w-28 rounded-full`} />
        <div className="space-y-3">
          <div className={`${styles.skeleton} h-10 w-48 rounded-2xl`} />
          <div className={`${styles.skeletonMuted} h-5 w-full max-w-[18rem] rounded-lg`} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className={`${styles.skeletonMuted} h-11 rounded-2xl`} />
          <div className={`${styles.skeletonMuted} h-11 rounded-2xl`} />
          <div className={`${styles.skeletonMuted} h-11 rounded-2xl`} />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className={`${styles.skeleton} h-4 w-16 rounded`} />
            <div className={`${styles.skeletonInset} h-12 rounded-[18px]`} />
          </div>
          <div className="space-y-2">
            <div className={`${styles.skeleton} h-4 w-24 rounded`} />
            <div className={`${styles.skeletonInset} h-12 rounded-[18px]`} />
          </div>
          <div className="h-12 rounded-[18px] bg-[rgba(48,209,88,0.18)]" />
        </div>
      </div>
    </div>
  );
}
