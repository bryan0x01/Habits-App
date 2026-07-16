"use client";

import * as React from "react";
import { useClerk, useSession, useUser } from "@clerk/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Cloud } from "lucide-react";

import { useStore } from "@/components/store-provider";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { isDayFlowSnapshot } from "@/lib/storage";

type SyncStatus =
  | "checking"
  | "demo"
  | "signed-out"
  | "syncing"
  | "synced"
  | "error";

interface CloudUser {
  id: string;
  email: string | null;
}

interface CloudContextValue {
  configured: boolean;
  ready: boolean;
  isPersistent: boolean;
  user: CloudUser | null;
  status: SyncStatus;
  error: string | null;
  supabase: SupabaseClient | null;
  signOut: () => Promise<void>;
}

const CloudContext = React.createContext<CloudContextValue | null>(null);

export function useCloud() {
  const context = React.useContext(CloudContext);
  if (!context) throw new Error("useCloud must be used within CloudProvider");
  return context;
}

export function CloudProvider({ children }: { children: React.ReactNode }) {
  const { hydrated, snapshot, importSnapshot, resetData } = useStore();
  const { isLoaded: sessionLoaded, session } = useSession();
  const { isLoaded: userLoaded, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const userId = session?.user.id ?? null;
  const authReady = sessionLoaded && userLoaded;

  const [status, setStatus] = React.useState<SyncStatus>(
    isSupabaseConfigured ? "checking" : "demo",
  );
  const [ready, setReady] = React.useState(!isSupabaseConfigured);
  const [error, setError] = React.useState<string | null>(null);
  const [retryToken, setRetryToken] = React.useState(0);
  const snapshotRef = React.useRef(snapshot);
  const activeUserRef = React.useRef<string | null>(null);
  const authHandledRef = React.useRef(false);
  const initializedUserRef = React.useRef<string | null>(null);
  const skipNextPushRef = React.useRef(false);

  snapshotRef.current = snapshot;

  const supabase = React.useMemo(
    () =>
      isSupabaseConfigured
        ? createSupabaseBrowserClient(() => session?.getToken() ?? Promise.resolve(null))
        : null,
    [session],
  );

  React.useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("demo");
      setReady(true);
      return;
    }
    if (!authReady) {
      setStatus("checking");
      setReady(false);
      return;
    }

    const previousUserId = activeUserRef.current;
    if (authHandledRef.current && previousUserId === userId) return;

    authHandledRef.current = true;
    activeUserRef.current = userId;
    initializedUserRef.current = null;
    setError(null);

    if (!userId) {
      setStatus("signed-out");
      setReady(true);
      if (previousUserId) resetData();
      return;
    }

    setStatus("syncing");
    setReady(false);
  }, [authReady, resetData, userId]);

  React.useEffect(() => {
    const retry = () => setRetryToken((token) => token + 1);
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, []);

  // A saved account always wins. For a new account, save the current starter
  // setup once so the person can continue without doing setup again.
  React.useEffect(() => {
    if (!supabase || !userId || !hydrated || !authReady) return;
    if (initializedUserRef.current === userId) return;

    let cancelled = false;
    const loadPlan = async () => {
      setStatus("syncing");
      const { data, error: readError } = await supabase
        .from("dayflow_snapshots")
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;
      if (readError) {
        setError(readError.message);
        setStatus("error");
        setReady(true);
        return;
      }

      if (data?.data && isDayFlowSnapshot(data.data)) {
        skipNextPushRef.current = true;
        importSnapshot(data.data);
      } else {
        const { error: writeError } = await supabase
          .from("dayflow_snapshots")
          .upsert({ user_id: userId, data: snapshotRef.current });
        if (writeError) {
          setError(writeError.message);
          setStatus("error");
          setReady(true);
          return;
        }
      }

      initializedUserRef.current = userId;
      setError(null);
      setStatus("synced");
      setReady(true);
    };

    void loadPlan();
    return () => {
      cancelled = true;
    };
  }, [authReady, hydrated, importSnapshot, retryToken, supabase, userId]);

  React.useEffect(() => {
    if (!supabase || !userId || !hydrated) return;
    if (initializedUserRef.current !== userId) return;
    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }

    const timer = window.setTimeout(async () => {
      setStatus("syncing");
      const { error: writeError } = await supabase
        .from("dayflow_snapshots")
        .upsert({ user_id: userId, data: snapshot });
      if (writeError) {
        setError(writeError.message);
        setStatus("error");
      } else {
        setError(null);
        setStatus("synced");
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [hydrated, retryToken, snapshot, supabase, userId]);

  const signOut = React.useCallback(async () => {
    await clerkSignOut();
  }, [clerkSignOut]);

  const user = React.useMemo<CloudUser | null>(
    () =>
      userId
        ? {
            id: userId,
            email: clerkUser?.primaryEmailAddress?.emailAddress ?? null,
          }
        : null,
    [clerkUser?.primaryEmailAddress?.emailAddress, userId],
  );

  const value = React.useMemo<CloudContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      ready,
      isPersistent: Boolean(userId) && status !== "error",
      user,
      status,
      error,
      supabase,
      signOut,
    }),
    [error, ready, signOut, status, supabase, user, userId],
  );

  return (
    <CloudContext.Provider value={value}>
      {ready ? (
        children
      ) : (
        <div className="flex min-h-dvh items-center justify-center bg-background px-6 text-foreground">
          <div className="flex max-w-xs items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Cloud className="size-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold">Getting DayFlow ready</p>
              <p className="text-xs text-muted-foreground">Loading your saved plan…</p>
            </div>
          </div>
        </div>
      )}
    </CloudContext.Provider>
  );
}
