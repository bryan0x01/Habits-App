import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const store = {
  hydrated: true,
  settings: {
    activeRoutineId: "balanced-week",
    energyMode: "medium" as const,
    minimumDay: false,
    onboarded: false,
    defaultSupportNeed: "varies" as const,
  },
  routines: [
    { id: "balanced-week", name: "Balanced week", description: "", emoji: "balance", blocks: [] },
    { id: "student-week", name: "Student week", description: "", emoji: "student", blocks: [] },
  ],
  setActiveRoutine: vi.fn(),
  setDefaultSupportNeed: vi.fn(),
  addRoutineTemplate: vi.fn(),
  createRoutine: vi.fn(() => "routine-new"),
  completeOnboarding: vi.fn(),
};

vi.mock("@/components/store-provider", () => ({
  useStore: () => store,
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  SignUpButton: ({ children }: { children: ReactNode }) => children,
  SignInButton: ({ children }: { children: ReactNode }) => children,
}));

import { Onboarding } from "@/components/onboarding";

describe("Onboarding", () => {
  beforeEach(() => {
    store.setActiveRoutine.mockClear();
    store.setDefaultSupportNeed.mockClear();
    store.addRoutineTemplate.mockClear();
    store.createRoutine.mockClear();
    store.completeOnboarding.mockClear();
  });

  it("personalizes support and activates the closest existing routine", () => {
    render(<Onboarding />);

    fireEvent.click(screen.getByRole("button", { name: "Set up DayFlow" }));
    fireEvent.click(screen.getByRole("button", { name: /Focus/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("radio", { name: /Mostly school/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("button", { name: "Create account" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "I already have an account" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));

    expect(screen.getByText("Staying focused")).toBeTruthy();
    expect(screen.getByText("Mostly school")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Go to Today" }));

    expect(store.setDefaultSupportNeed).toHaveBeenCalledWith("focus");
    expect(store.setActiveRoutine).toHaveBeenCalledWith("student-week");
    expect(store.completeOnboarding).toHaveBeenCalledOnce();
  });

  it("offers a zero-friction path that keeps the editable defaults", () => {
    render(<Onboarding />);

    fireEvent.click(screen.getByRole("button", { name: "Use the starter setup" }));

    expect(screen.getByRole("heading", { name: "Save your plan" })).toBeTruthy();
    expect(store.completeOnboarding).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    fireEvent.click(screen.getByRole("button", { name: "Go to Today" }));

    expect(store.setActiveRoutine).toHaveBeenCalledWith("balanced-week");
    expect(store.completeOnboarding).toHaveBeenCalledOnce();
  });

  it("presents DayFlow as a Halynt product without implying a legal entity", () => {
    render(<Onboarding />);

    expect(screen.getAllByText(/by Halynt/).length).toBeGreaterThan(0);
    expect(screen.getByText("A Halynt product")).toBeTruthy();
  });
});
