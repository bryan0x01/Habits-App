import { act, render, screen, waitFor } from "@testing-library/react";
import type { Session } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const resetData = vi.fn();
  const importSnapshot = vi.fn();
  let authListener: ((event: string, session: unknown) => void) | null = null;

  const pendingRead = new Promise(() => undefined);
  const maybeSingle = vi.fn(() => pendingRead);
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  const session = {
    access_token: "test-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: 9999999999,
    refresh_token: "refresh-token",
    user: { id: "user-1" },
  } as Session;

  const client = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      onAuthStateChange: vi.fn((listener) => {
        authListener = listener;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
    },
    from,
  };

  return {
    client,
    from,
    importSnapshot,
    resetData,
    getAuthListener: () => authListener,
  };
});

vi.mock("@/components/store-provider", () => ({
  useStore: () => ({
    hydrated: true,
    snapshot: { version: 2 },
    importSnapshot: mocks.importSnapshot,
    resetData: mocks.resetData,
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: true,
  createSupabaseBrowserClient: () => mocks.client,
}));

import { CloudProvider } from "@/components/cloud-provider";

describe("CloudProvider", () => {
  it("clears private account data from memory when the user signs out", async () => {
    render(
      <CloudProvider>
        <p>Private plan</p>
      </CloudProvider>,
    );

    await waitFor(() => expect(mocks.from).toHaveBeenCalledWith("dayflow_snapshots"));
    const listener = mocks.getAuthListener();
    expect(listener).not.toBeNull();

    act(() => listener?.("SIGNED_OUT", null));

    await waitFor(() => expect(mocks.resetData).toHaveBeenCalledOnce());
    expect(screen.getByText("Private plan")).toBeTruthy();
  });
});
