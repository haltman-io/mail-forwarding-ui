"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  AdminAuthProvider,
  useAdminAuth,
} from "@/features/dashboard/hooks/use-admin-auth";

function LoginFormInner({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { status, login } = useAdminAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard/domains");
    }
  }, [status, router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setFeedback("Email is required.");
      return;
    }

    if (!password.trim()) {
      setFeedback("Password is required.");
      return;
    }

    setFeedback(null);
    setBusy(true);

    try {
      const result = await login(trimmedEmail, password);

      if (!result.ok) {
        setFeedback(result.error ?? "Authentication failed.");
        return;
      }

      router.replace("/dashboard/domains");
    } finally {
      setBusy(false);
    }
  }

  const [hostLabel, setHostLabel] = React.useState("haltman.io");
  React.useEffect(() => {
    if (window.location.host) setHostLabel(window.location.host);
  }, []);

  if (status === "checking") {
    return (
      <div className={cn("flex items-center justify-center py-16", className)} {...props}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">{hostLabel}</h1>
            <FieldDescription>
              Sign in to access the admin dashboard.
            </FieldDescription>
          </div>

          {feedback && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {feedback}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              required
              disabled={busy}
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={busy}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Field>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <AdminAuthProvider>
      <LoginFormInner className={className} {...props} />
    </AdminAuthProvider>
  );
}
