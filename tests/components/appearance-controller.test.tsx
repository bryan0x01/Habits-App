import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const store = {
  settings: {
    theme: "system" as "light" | "dark" | "system",
    interfaceColor: "iris" as "iris" | "blue" | "teal" | "rose" | "amber",
  },
};

vi.mock("@/components/store-provider", () => ({ useStore: () => store }));

import { AppearanceController } from "@/components/appearance-controller";

describe("AppearanceController", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    delete document.documentElement.dataset.accent;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    store.settings.theme = "system";
    store.settings.interfaceColor = "iris";
  });

  it("uses the system brightness and synced color", () => {
    store.settings.interfaceColor = "teal";
    render(<AppearanceController />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.accent).toBe("teal");
  });

  it("lets an explicit light preference override the system", () => {
    store.settings.theme = "light";
    store.settings.interfaceColor = "rose";
    render(<AppearanceController />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.dataset.accent).toBe("rose");
  });
});
