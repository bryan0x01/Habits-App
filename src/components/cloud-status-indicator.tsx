"use client";

import Link from "next/link";
import { Cloud, CloudOff, RefreshCw, TriangleAlert } from "lucide-react";

import { useCloud } from "@/components/cloud-provider";
import { cn } from "@/lib/utils";

export function CloudStatusIndicator() {
  const { configured, user, status } = useCloud();

  const state = !configured
    ? { label: "Preview mode", icon: CloudOff, className: "text-amber-600 dark:text-amber-400" }
    : !user
      ? { label: "Sign in to save", icon: CloudOff, className: "text-amber-600 dark:text-amber-400" }
    : status === "error"
      ? { label: "Couldn’t save", icon: TriangleAlert, className: "text-destructive" }
      : status === "syncing"
        ? { label: "Saving", icon: RefreshCw, className: "text-primary" }
        : { label: "Saved", icon: Cloud, className: "text-success" };
  const Icon = state.icon;

  return (
    <Link
      href="/settings#cloud"
      aria-label={state.label}
      title={state.label}
      className={cn(
        "relative flex size-10 items-center justify-center rounded-xl hover:bg-accent",
        state.className,
      )}
    >
      <Icon className={cn("size-5", status === "syncing" && "animate-spin")} />
      {!user ? <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-amber-500 ring-2 ring-background" /> : null}
    </Link>
  );
}
