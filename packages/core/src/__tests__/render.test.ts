import { describe, expect, it } from "@osmoscraft/test-utils";
import { render } from "../lib/render/render";

describe("Render", () => {
  it("Renders empty feed", async () => {
    const result = render([], "");
    expect(result.includes("<!DOCTYPE html>")).toEqual(true);
  });
});
