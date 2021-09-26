import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { encodeUrl } from "../encode-url";

describe("encodeUrl", () => {
  it("handles url that doesn't need encoding", async () => {
    expect(encodeUrl("https://www.mockdomain.com")).toEqual("https://www.mockdomain.com");
  });

  it("handles url that needs encoding", async () => {
    expect(encodeUrl("https://www.mockdomain.com/hello world")).toEqual("https://www.mockdomain.com/hello%20world");
  });

  it("handles url that is encoded", async () => {
    expect(encodeUrl("https://www.mockdomain.com/hello%20world")).toEqual("https://www.mockdomain.com/hello%20world");
  });

  it("handles url unicode characters", async () => {
    expect(encodeUrl("https://www.你好.com?query=世界")).toEqual(
      "https://www.%E4%BD%A0%E5%A5%BD.com?query=%E4%B8%96%E7%95%8C"
    );
  });
});
