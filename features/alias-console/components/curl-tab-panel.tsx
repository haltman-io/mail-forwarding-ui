import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";

import { CopyLabel } from "@/features/alias-console/components/copy-label";

type CurlTabPanelProps = {
  copiedId: string | null;
  curlSubscribe: string;
  curlUnsubscribe: string;
  codeBlockClass: string;
  clickableIconClass: string;
  canCopySubscribe: boolean;
  canCopyUnsubscribe: boolean;
  onCopySubscribe: () => void;
  onCopyUnsubscribe: () => void;
};

export function CurlTabPanel({
  copiedId,
  curlSubscribe,
  curlUnsubscribe,
  codeBlockClass,
  clickableIconClass,
  canCopySubscribe,
  canCopyUnsubscribe,
  onCopySubscribe,
  onCopyUnsubscribe,
}: CurlTabPanelProps) {
  return (
    <TabsContent value="curl" className="mt-6 hidden space-y-4 sm:block">
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-200">RAW CURL</p>
            <p className="text-xs text-zinc-400">Just copy, paste and run. No mistery.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="group border-white/10 bg-white/5 hover:bg-white/10"
              onClick={onCopySubscribe}
              disabled={!canCopySubscribe}
            >
              {copiedId === "curl-subscribe-tab" ? (
                <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
              ) : (
                <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
              )}
              <CopyLabel copied={copiedId === "curl-subscribe-tab"} label="COPY (CREATE)" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="group border-white/10 bg-white/5 hover:bg-white/10"
              onClick={onCopyUnsubscribe}
              disabled={!canCopyUnsubscribe}
            >
              {copiedId === "curl-unsubscribe-tab" ? (
                <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
              ) : (
                <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
              )}
              <CopyLabel copied={copiedId === "curl-unsubscribe-tab"} label="COPY (DELETE)" />
            </Button>
          </div>
        </div>

        <Separator className="my-4 bg-white/10" />

        <div className="space-y-3">
          <div className="rounded-lg border border-white/10 bg-black/40 p-3">
            <p className="text-xs text-zinc-400">CREATE</p>
            <pre className={`mt-1 ${codeBlockClass}`}>{curlSubscribe}</pre>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/40 p-3">
            <p className="text-xs text-zinc-400">DELETE</p>
            <pre className={`mt-1 ${codeBlockClass}`}>{curlUnsubscribe}</pre>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
