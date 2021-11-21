import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { renderSite } from "../lib";

describe("Render", () => {
  it("Renders empty feed", async () => {
    const result = renderSite({
      assets: [],
      data: [],
    });
    expect(result.includes("<!DOCTYPE html>")).toEqual(true);
  });
});
