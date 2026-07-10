"use client";

import * as React from "react";
import { Cloud, CloudOff, LogOut, Mail, RefreshCw } from "lucide-react";

import { useCloud } from "@/components/cloud-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_COPY = {
  local: "Local-only mode",
  "signed-out": "Sign in to sync this device",
  syncing: "Syncing your changes…",
  synced: "Synced privately",
  error: "Sync needs attention",
} as const;

export function CloudSyncCard() {
  const { configured, user, status, error, sendMagicLink, signOut } = useCloud();
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);

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
            Cloud sync will be available after this deployment gets its Supabase settings.
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
                One email link keeps your routines private and available wherever you are.
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
              {sending ? "Sending" : "Sync"}
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
