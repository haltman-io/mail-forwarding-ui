import type { FormEvent, ReactNode } from "react";
import { MailPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";

type UnsubscribeTabPanelProps = {
  alias: string;
  requestBusy: boolean;
  unsubscribeButtonContent: ReactNode;
  curlUnsubscribe: string;
  codeBlockClass: string;
  clickableIconClass: string;
  onAliasChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onGoToCreateAlias: () => void;
};

export function UnsubscribeTabPanel({
  alias,
  requestBusy,
  unsubscribeButtonContent,
  curlUnsubscribe,
  codeBlockClass,
  clickableIconClass,
  onAliasChange,
  onSubmit,
  onGoToCreateAlias,
}: UnsubscribeTabPanelProps) {
  return (
    <TabsContent value="unsubscribe" className="mt-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="space-y-5 lg:col-span-3">
          <div className="space-y-2">
            <Label htmlFor="alias">ALIAS</Label>
            <Input
              id="alias"
              type="email"
              placeholder="docs.curl@fwd.haltman.io"
              value={alias}
              onChange={(e) => onAliasChange(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="bg-black/30"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button type="submit" className="group w-full sm:w-auto" disabled={requestBusy}>
              {unsubscribeButtonContent}
            </Button>
          </div>
        </form>

        <div className="space-y-3 lg:col-span-2">
          <div className="hidden rounded-xl border border-white/10 bg-black/30 p-4 sm:block">
            <p className="text-sm font-medium text-zinc-200">REQUEST PREVIEW</p>
            <Separator className="my-3 bg-white/10" />

            <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3">
              <pre className={`mt-1 ${codeBlockClass}`}>{curlUnsubscribe}</pre>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="group w-full border-white/10 bg-white/5 hover:bg-white/10"
            onClick={onGoToCreateAlias}
          >
            <MailPlus className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
            CLICK TO CREATE ALIAS
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
