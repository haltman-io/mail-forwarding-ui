"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    id: "why-exists",
    question: "Why does this service exist?",
    answer: (
      <>
        <p>
          This service exists because mail forwarding should be verifiable,
          not performed behind marketing slogans. The source is open, the
          infrastructure is auditable, and you should be able to inspect what
          is running instead of trusting a brand voice.
        </p>
        <p>
          We do not sell access to alias addresses. We do not hand metadata to
          federal agencies. We do not pretend that cooperation with law
          enforcement suddenly becomes privacy because someone wrapped it in
          encryption language.
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
          No compliance theater. No privacy branding. Just routing.
        </p>
      </>
    ),
  },
  {
    id: "what-you-get",
    question: "What do I get?",
    answer: (
      <>
        <p>
          You get 48 domains, unlimited aliases, and unlimited destinations.
          Pick a handle, point it at your real inbox, and mail gets forwarded.
        </p>
        <p>
          Basic use does not require an account. There is no payment, no trial
          period, and no upsell funnel attached to the service.
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Free until the infrastructure dies or we get raided.
        </p>
      </>
    ),
  },
  {
    id: "no-brand-theater",
    question: "Why is there no brand or startup theater?",
    answer: (
      <>
        <p>
          The domains are real:
          {" "}
          <span className="font-mono text-[var(--neu-green)]">reads.phrack.org</span>,
          {" "}
          <span className="font-mono text-[var(--neu-green)]">free.team-teso.net</span>,
          {" "}
          <span className="font-mono text-[var(--neu-green)]">smokes.thc.org</span>,
          {" "}
          <span className="font-mono text-[var(--neu-green)]">segfault.net</span>,
          {" "}
          <span className="font-mono text-[var(--neu-green)]">lockbit.io</span>,
          {" "}
          <span className="font-mono text-[var(--neu-green)]">metasploit.io</span>,
          {" "}
          <span className="font-mono text-[var(--neu-green)]">lulz.antisec.net</span>,
          {" "}
          <span className="font-mono text-[var(--neu-green)]">ghetto.eurocompton.net</span>
          {" "}
          and 21 more. They are not disposable registrar filler.
        </p>
        <p>
          There is no VC money, no advisory board, and no growth dashboard
          driving the product. The service was built by people who actually run
          mail infrastructure.
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Owned by operators, not committees.
        </p>
      </>
    ),
  },
] as const;

export default function FaqPage() {
  const [openItem, setOpenItem] = React.useState<string | null>(FAQ_ITEMS[0].id);

  return (
    <>
      <SiteHeader />

      <main className="relative mx-auto max-w-[960px] px-4 pt-24 pb-28 sm:px-6 sm:pt-36 sm:pb-32">
        <article className="mx-auto max-w-[740px]">
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </Link>

          <header className="space-y-4">
            <h1 className="font-mono text-lg font-semibold uppercase tracking-[0.06em] text-[var(--text-primary)] sm:text-xl">
              Frequently Asked Questions
            </h1>
            <p className="font-mono text-sm uppercase tracking-[0.04em] text-[var(--neu-green)]">
              Answers about the mail forwarding service.
            </p>
          </header>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          <section className="space-y-3">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openItem === item.id;

              return (
                <Collapsible
                  key={item.id}
                  open={isOpen}
                  onOpenChange={(open) => setOpenItem(open ? item.id : null)}
                  className="overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)]"
                >
                  <CollapsibleTrigger
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--hover-state)]"
                  >
                    <span className="font-mono text-sm font-semibold uppercase tracking-[0.05em] text-[var(--text-primary)]">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200",
                        isOpen && "rotate-180 text-[var(--text-secondary)]",
                      )}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="border-t border-[var(--glass-border)]">
                    <div className="space-y-4 px-5 py-4 font-mono text-sm leading-[1.7] text-[var(--text-secondary)]">
                      {item.answer}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </section>
        </article>
      </main>
    </>
  );
}
