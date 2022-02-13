import { describe, expect, it } from "vitest";
import { normalizeUrl } from "../normalize-url";

describe("normalizeUrl", () => {
  it("handles url that doesn't need encoding", async () => {
    await expect(normalizeUrl("https://www.mockdomain.com")).toEqual("https://www.mockdomain.com");
  });

  it("handles url that needs encoding", async () => {
    await expect(normalizeUrl("https://www.mockdomain.com/hello world")).toEqual(
      "https://www.mockdomain.com/hello%20world"
    );
  });

  it("handles url that is encoded", async () => {
    await expect(normalizeUrl("https://www.mockdomain.com/hello%20world")).toEqual(
      "https://www.mockdomain.com/hello%20world"
    );
  });

  it("handles url unicode characters", async () => {
    await expect(normalizeUrl("https://www.你好.com?query=世界")).toEqual(
      "https://www.%E4%BD%A0%E5%A5%BD.com?query=%E4%B8%96%E7%95%8C"
    );
  });
});
