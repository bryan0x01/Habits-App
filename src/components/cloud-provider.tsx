"use client";

import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { Cloud } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { isDayFlowSnapshot } from "@/lib/storage";

type SyncStatus = "checking" | "demo" | "signed-out" | "syncing" | "synced" | "error";

interface CloudContextValue {
  configured: boolean;
  ready: boolean;
  isPersistent: boolean;
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
    resetData,
  } = useStore();
  const [session, setSession] = React.useState<Session | null>(null);
  const [status, setStatus] = React.useState<SyncStatus>(
    isSupabaseConfigured ? "checking" : "demo",
  );
  const [ready, setReady] = React.useState(!isSupabaseConfigured);
  const [error, setError] = React.useState<string | null>(null);
  const [retryToken, setRetryToken] = React.useState(0);
  const snapshotRef = React.useRef(snapshot);
  const authUserRef = React.useRef<string | null>(null);
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
    let sessionSettled = false;
    const sessionTimeout = window.setTimeout(() => {
      if (!alive || sessionSettled) return;
      setStatus("signed-out");
      setReady(true);
    }, 2500);
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return;
      sessionSettled = true;
      window.clearTimeout(sessionTimeout);
      if (sessionError) {
        setError(sessionError.message);
        setStatus("error");
        setReady(true);
        return;
      }
      authUserRef.current = data.session?.user.id ?? null;
      setSession(data.session);
      if (data.session) {
        setStatus("syncing");
        setReady(false);
      } else {
        setStatus("signed-out");
        setReady(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUserId = nextSession?.user.id ?? null;
      if (authUserRef.current === nextUserId) {
        setSession(nextSession);
        return;
      }
      const previousUserId = authUserRef.current;
      authUserRef.current = nextUserId;
      initializedUserRef.current = null;
      setSession(nextSession);
      setError(null);
      setStatus(nextSession ? "syncing" : "signed-out");
      setReady(!nextSession);
      if (previousUserId && !nextUserId) resetData();
    });

    return () => {
      alive = false;
      window.clearTimeout(sessionTimeout);
      subscription.unsubscribe();
    };
  }, [resetData, supabase]);

  React.useEffect(() => {
    const retry = () => setRetryToken((token) => token + 1);
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, []);

  // The private cloud snapshot always wins. A brand-new account saves the
  // current in-memory starter/preview snapshot once, so setup work is preserved.
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
        setReady(true);
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
          setReady(true);
          return;
        }
      }

      initializedUserRef.current = session.user.id;
      setStatus("synced");
      setReady(true);
    };

    void initializeSync();
    return () => {
      cancelled = true;
    };
  }, [hydrated, importSnapshot, retryToken, session?.user, supabase]);

  // A brief debounce groups quick taps into one Supabase write.
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
  }, [hydrated, retryToken, session?.user, snapshot, supabase]);

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
      ready,
      isPersistent: Boolean(session?.user) && status !== "error",
      user: session?.user ?? null,
      status,
      error,
      sendMagicLink,
      signOut,
    }),
    [error, ready, sendMagicLink, session?.user, signOut, status],
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
              <p className="text-sm font-semibold">Opening DayFlow by Halynt</p>
              <p className="text-xs text-muted-foreground">Loading your private plan from Supabase…</p>
            </div>
          </div>
        </div>
      )}
    </CloudContext.Provider>
  );
}
