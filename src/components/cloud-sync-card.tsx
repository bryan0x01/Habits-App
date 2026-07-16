"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Cloud, CloudOff, LogOut, RefreshCw } from "lucide-react";

import { useCloud } from "@/components/cloud-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_COPY = {
  checking: "Checking your account…",
  demo: "Changes won’t be saved yet",
  "signed-out": "Sign in to save your plan",
  syncing: "Saving…",
  synced: "Everything is saved",
  error: "We couldn’t save your latest changes",
} as const;

export function CloudSyncCard() {
  const { configured, user, status, error, signOut } = useCloud();

  if (!configured) {
    return (
      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <CloudOff className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold">Saving isn’t connected yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              You can look around, but changes on this deployment won’t last.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Cloud className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Save your DayFlow</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Create an account to keep your setup and use it on your other devices.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SignUpButton mode="modal">
              <Button className="w-full">Create account</Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button variant="outline" className="w-full">Sign in</Button>
            </SignInButton>
          </div>
          <p className="text-xs text-muted-foreground">
            Without an account, this preview resets when you refresh.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <UserButton />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.email ?? "Your account"}</p>
          <p className="text-xs text-muted-foreground">
            {error ?? STATUS_COPY[status]}
          </p>
        </div>
        {status === "syncing" ? (
          <RefreshCw className="size-4 animate-spin text-primary" aria-label="Saving" />
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void signOut()}
          aria-label="Sign out"
        >
          <LogOut className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
