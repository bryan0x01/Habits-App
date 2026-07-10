"use client";

import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";

import { useStore } from "@/components/store-provider";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { isDayFlowSnapshot } from "@/lib/storage";

type SyncStatus = "local" | "signed-out" | "syncing" | "synced" | "error";

interface CloudContextValue {
  configured: boolean;
  user: User | null;
  status: SyncStatus;
  error: string | null;
  sendMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const CloudContext = React.createContext<CloudContextValue | null>(null);

export function useCloud() {
  const context = React.useContext(CloudContext);
  if (!context) throw new Error("useCloud must be used within CloudProvider");
  return context;
}

export function CloudProvider({ children }: { children: React.ReactNode }) {
  const {
    hydrated,
    snapshot,
    importSnapshot,
  } = useStore();
  const [session, setSession] = React.useState<Session | null>(null);
  const [status, setStatus] = React.useState<SyncStatus>(
    isSupabaseConfigured ? "signed-out" : "local",
  );
  const [error, setError] = React.useState<string | null>(null);
  const snapshotRef = React.useRef(snapshot);
  const initializedUserRef = React.useRef<string | null>(null);
  const skipNextPushRef = React.useRef(false);

  snapshotRef.current = snapshot;

  const supabase = React.useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [],
  );

  React.useEffect(() => {
    if (!supabase) return;

    let alive = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setStatus(data.session ? "syncing" : "signed-out");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      initializedUserRef.current = null;
      setSession(nextSession);
      setError(null);
      setStatus(nextSession ? "syncing" : "signed-out");
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // On a new device the saved cloud snapshot wins. On a new account, the local
  // snapshot is uploaded once, so existing DayFlow users do not lose their data.
  React.useEffect(() => {
    if (!supabase || !session?.user || !hydrated) return;
    if (initializedUserRef.current === session.user.id) return;

    let cancelled = false;
    const initializeSync = async () => {
      setStatus("syncing");
      const { data, error: readError } = await supabase
        .from("dayflow_snapshots")
        .select("data")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (cancelled) return;
      if (readError) {
        setError(readError.message);
        setStatus("error");
        return;
      }

      if (data?.data && isDayFlowSnapshot(data.data)) {
        skipNextPushRef.current = true;
        importSnapshot(data.data);
      } else {
        const { error: writeError } = await supabase.from("dayflow_snapshots").upsert({
          user_id: session.user.id,
          data: snapshotRef.current,
        });
        if (writeError) {
          setError(writeError.message);
          setStatus("error");
          return;
        }
      }

      initializedUserRef.current = session.user.id;
      setStatus("synced");
    };

    void initializeSync();
    return () => {
      cancelled = true;
    };
  }, [hydrated, importSnapshot, session?.user, supabase]);

  // Keep the UI local-first. A brief debounce groups quick taps into one write.
  React.useEffect(() => {
    if (!supabase || !session?.user || !hydrated) return;
    if (initializedUserRef.current !== session.user.id) return;
    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }

    const timer = window.setTimeout(async () => {
      setStatus("syncing");
      const { error: writeError } = await supabase.from("dayflow_snapshots").upsert({
        user_id: session.user.id,
        data: snapshot,
      });
      if (writeError) {
        setError(writeError.message);
        setStatus("error");
      } else {
        setError(null);
        setStatus("synced");
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [hydrated, session?.user, snapshot, supabase]);

  const sendMagicLink = React.useCallback(
    async (email: string) => {
      if (!supabase) return { error: "Cloud sync is not configured." };
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      return { error: authError?.message ?? null };
    },
    [supabase],
  );

  const signOut = React.useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  const value = React.useMemo<CloudContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      user: session?.user ?? null,
      status,
      error,
      sendMagicLink,
      signOut,
    }),
    [error, sendMagicLink, session?.user, signOut, status],
  );

  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
}
