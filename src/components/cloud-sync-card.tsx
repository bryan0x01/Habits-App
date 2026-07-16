"use client";

import * as React from "react";
import { Cloud, CloudOff, LogOut, Mail, RefreshCw } from "lucide-react";

import { useCloud } from "@/components/cloud-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_COPY = {
  checking: "Checking your account…",
  demo: "Preview only — changes are temporary",
  "signed-out": "Sign in to save your plan",
  syncing: "Saving your changes…",
  synced: "Saved privately in Supabase",
  error: "Saving needs attention",
} as const;

export function CloudSyncCard() {
  const { configured, user, status, error, sendMagicLink, signOut } = useCloud();
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);

  // Surface the outcome of the magic-link callback (?auth=error|ok), then clean
  // the URL so the message doesn't stick around on refresh.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    if (auth === "error") {
      setMessage(
        "That sign-in link didn't work. Links expire fast and must be opened in the same browser. Send a fresh one, and make sure this site's URL is in your Supabase redirect list.",
      );
    } else if (auth === "ok") {
      setMessage("You're signed in. Your data now syncs privately across devices.");
    }
    if (auth) {
      params.delete("auth");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (query ? `?${query}` : ""),
      );
    }
  }, []);

  const submit = async () => {
    if (!email.trim()) return;
    setSending(true);
    const result = await sendMagicLink(email);
    setSending(false);
    setMessage(result.error ?? "Check your email for the sign-in link.");
  };

  if (!configured) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <CloudOff className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Preview mode only. Add this deployment&apos;s Supabase settings before relying on it for real data.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Cloud className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Sync across your devices</p>
              <p className="text-xs text-muted-foreground">
                Sign in with one email link. Until then, changes are temporary and disappear on refresh.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor="sync-email" className="sr-only">Email</Label>
              <Input
                id="sync-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void submit();
                }}
                placeholder="you@email.com"
              />
            </div>
            <Button onClick={() => void submit()} disabled={!email.trim() || sending}>
              <Mail className="size-4" />
              {sending ? "Sending" : "Send link"}
            </Button>
          </div>
          {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {status === "syncing" ? <RefreshCw className="size-5 animate-spin" /> : <Cloud className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.email ?? "Signed in"}</p>
          <p className="text-xs text-muted-foreground">{error ?? STATUS_COPY[status]}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => void signOut()} aria-label="Sign out">
          <LogOut className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
