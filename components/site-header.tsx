import Link from "next/link";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Github, Send } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
        {/* Left: logo */}
        <div className="flex w-1/3 items-center">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="text-sm">Haltman</span>
            <span className="text-muted-foreground text-sm">Free Mail Forwarding Service</span>
          </Link>
        </div>

        {/* Center: nav */}
        <div className="flex w-1/3 justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link
                  href="https://www.haltman.io"
                  className="text-sm text-foreground/90 hover:text-foreground"
                  target="_blank"
                  rel="noreferrer"
                >
                  www.haltman.io
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right: icons */}
        <div className="flex w-1/3 items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="GitHub">
            <Link href="https://github.com/haltman-io" target="_blank" rel="noreferrer">
              <Github className="h-5 w-5" />
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" aria-label="Telegram">
            <Link href="https://t.me/haltmanio" target="_blank" rel="noreferrer">
              <Send className="h-5 w-5" />
            </Link>
          </Button>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
