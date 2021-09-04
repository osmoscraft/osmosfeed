import { describe, expect, it } from "@osmoscraft/test-utils";
import { render } from "../lib/render/render";

describe("render", () => {
  it("renders empty feed", async () => {
    const result = render([]);
    expect(result.includes("<!DOCTYPE html>")).toEqual(true);
  });
});
