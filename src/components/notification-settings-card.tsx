"use client";

import * as React from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

import { useCloud } from "@/components/cloud-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supportsWebPush, urlBase64ToUint8Array } from "@/lib/notifications";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function NotificationSettingsCard() {
  const { user, supabase } = useCloud();
  const [enabled, setEnabled] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const supported = typeof window !== "undefined" && supportsWebPush();

  React.useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setEnabled(Boolean(subscription)))
      .catch(() => setEnabled(false));
  }, [supported]);

  const toggle = async () => {
    if (!user || !supabase || !publicKey || !supported) return;
    setBusy(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const current = await registration.pushManager.getSubscription();
      if (current) {
        const { error } = await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", current.endpoint);
        if (error) throw error;
        await current.unsubscribe();
        setEnabled(false);
        setMessage("Reminders turned off.");
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") throw new Error("Notifications were not allowed in this browser.");
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });
        const { error } = await supabase.from("push_subscriptions").upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          subscription: subscription.toJSON(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          enabled: true,
        }, { onConflict: "endpoint" });
        if (error) {
          await subscription.unsubscribe();
          throw error;
        }
        setEnabled(true);
        setMessage("Reminders are on.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Couldn't update reminders.");
    } finally {
      setBusy(false);
    }
  };

  const detail = !supported
    ? "This browser does not support Web Push. On iPhone, install DayFlow to the Home Screen first."
    : !user
      ? "Sign in first to turn on reminders."
      : !publicKey
        ? "Reminders still need to be connected on this deployment."
        : enabled ? "On for this device. Each block uses its own reminder time." : "Off for this device.";

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {enabled ? <Bell className="size-5" /> : <BellOff className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Push reminders</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
          <Button size="sm" variant={enabled ? "outline" : "default"} disabled={busy || !supported || !user || !supabase || !publicKey} onClick={toggle}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : enabled ? "Turn off" : "Turn on"}
          </Button>
        </div>
        {message ? <p role="status" className="text-xs text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
