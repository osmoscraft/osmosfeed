import { describe, expect, it } from "vitest";
import { sha1 } from "../hash";

describe("hash", () => {
  it("sha1", () => {
    expect(sha1("foo")).toBe("0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33");
  });
});
