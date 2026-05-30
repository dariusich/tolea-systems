import { describe, expect, it } from "vitest";

import { money, percent } from "./format";

describe("format helpers", () => {
  it("keeps cents for fractional trading PnL", () => {
    expect(money(-0.01)).toBe("-$0.01");
    expect(money(349)).toBe("$349");
  });

  it("formats percentages with two decimals by default", () => {
    expect(percent(2.5)).toBe("2.50%");
  });
});
