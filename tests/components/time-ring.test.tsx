import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TimeRing } from "@/components/time-ring";

describe("TimeRing", () => {
  it("exposes its meaning without relying on color", () => {
    render(<TimeRing progress={0.5} label="12 min" sublabel="left" />);

    expect(screen.getByRole("img", { name: "12 min left" })).toBeTruthy();
  });

  it("clamps progress so invalid values cannot overdraw the ring", () => {
    const { container, rerender } = render(
      <TimeRing progress={2} label="Full" />,
    );
    const progressCircle = container.querySelectorAll("circle")[1];
    expect(progressCircle.getAttribute("stroke-dashoffset")).toBe("0");

    rerender(<TimeRing progress={-1} label="Empty" />);
    const emptyCircle = container.querySelectorAll("circle")[1];
    expect(emptyCircle.getAttribute("stroke-dashoffset")).toBe(
      emptyCircle.getAttribute("stroke-dasharray"),
    );
  });
});
