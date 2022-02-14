import { describe, expect, it } from "vitest";
import { getOffsetFromTimezoneName } from "../time";

describe("getOffsetFromTimezoneName", () => {
  it("handles url that doesn't need encoding", () => {
    // Note that the symbol is inverted from international convention
    expect(getOffsetFromTimezoneName("Asia/Shanghai")).toBe(-480); // +8
    expect(getOffsetFromTimezoneName("Asia/Tokyo")).toBe(-540); // +9
    expect(getOffsetFromTimezoneName("UTC")).toBe(0);
    expect(getOffsetFromTimezoneName("EST")).toBe(300);
    expect(getOffsetFromTimezoneName("Pacific/Honolulu")).toBe(600);
  });
});
