"use client";

import * as React from "react";
import { ChevronDown, PanelTop, Chromium, Flame } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";


export function BrowserAddonMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="group relative h-8 overflow-visible border-white/10 bg-white/5 px-2.5 text-zinc-200 hover:bg-white/10"
          aria-label="Browser Extension"
        >
          <Chromium className={`h-4 w-4 ${clickableIconClass}`} />
          Browser Extension
          <ChevronDown className="ml-2 h-3.5 w-3.5 text-zinc-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 border-white/10 bg-black/80 text-zinc-200 backdrop-blur"
      >
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/email-alias-manager-free/"
            target="_blank"
            rel="noreferrer"
          >
            <Flame className={`h-4 w-4 ${clickableIconClass}`} />
            Mozilla Firefox
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
          <a
            href="https://github.com/haltman-io/mail-forwarding-addon-google-chrome"
            target="_blank"
            rel="noreferrer"
          >
            <Chromium className={`h-4 w-4 ${clickableIconClass}`} />
            Google Chrome
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
