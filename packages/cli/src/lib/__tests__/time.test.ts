import { describe, expect, it } from "vitest";
import { getOffsetFromTimezoneName } from "../time";

describe("getOffsetFromTimezoneName", () => {
  it("handles url that doesn't need encoding", () => {
    // Note that the symbol is inverted from international convention
    // Source: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    expect(getOffsetFromTimezoneName("Asia/Shanghai")).toBe(-480); // GMT+8
    expect(getOffsetFromTimezoneName("Asia/Tokyo")).toBe(-540); // GMT+9
    expect(getOffsetFromTimezoneName("UTC")).toBe(0);
    expect(getOffsetFromTimezoneName("EST")).toBe(300); // GMT-5
    expect(getOffsetFromTimezoneName("Pacific/Honolulu")).toBe(600); //GMT-10
  });
});
