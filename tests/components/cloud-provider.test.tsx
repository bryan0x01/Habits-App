import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const resetData = vi.fn();
  const importSnapshot = vi.fn();
  const clerkSignOut = vi.fn();
  const getToken = vi.fn().mockResolvedValue("clerk-token");
  const pendingRead = new Promise(() => undefined);
  const maybeSingle = vi.fn(() => pendingRead);
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  const client = { from };
  const clerk = {
    session: { user: { id: "user-1" }, getToken },
    user: {
      primaryEmailAddress: { emailAddress: "person@example.com" },
    },
  } as {
    session: { user: { id: string }; getToken: typeof getToken } | null;
    user: { primaryEmailAddress: { emailAddress: string } } | null;
  };

  return { client, clerk, clerkSignOut, from, importSnapshot, resetData };
});

vi.mock("@clerk/nextjs", () => ({
  useSession: () => ({ isLoaded: true, session: mocks.clerk.session }),
  useUser: () => ({ isLoaded: true, user: mocks.clerk.user }),
  useClerk: () => ({ signOut: mocks.clerkSignOut }),
}));

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
  beforeEach(() => {
    mocks.from.mockClear();
    mocks.resetData.mockClear();
    mocks.clerk.session = {
      user: { id: "user-1" },
      getToken: vi.fn().mockResolvedValue("clerk-token"),
    };
    mocks.clerk.user = {
      primaryEmailAddress: { emailAddress: "person@example.com" },
    };
  });

  it("clears private account data from memory when the user signs out", async () => {
    const { rerender } = render(
      <CloudProvider>
        <p>Private plan</p>
      </CloudProvider>,
    );

    await waitFor(() => expect(mocks.from).toHaveBeenCalledWith("dayflow_snapshots"));

    act(() => {
      mocks.clerk.session = null;
      mocks.clerk.user = null;
      rerender(
        <CloudProvider>
          <p>Private plan</p>
        </CloudProvider>,
      );
    });

    await waitFor(() => expect(mocks.resetData).toHaveBeenCalledOnce());
    expect(screen.getByText("Private plan")).toBeTruthy();
  });

  it("opens the signed-out preview after Clerk finishes loading", async () => {
    mocks.clerk.session = null;
    mocks.clerk.user = null;

    render(
      <CloudProvider>
        <p>Preview plan</p>
      </CloudProvider>,
    );

    expect(await screen.findByText("Preview plan")).toBeTruthy();
  });
});
