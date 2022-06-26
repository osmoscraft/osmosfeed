import { describe, expect, it } from "vitest";
import { sha1 } from "../hash";
import { escapeUnicodeUrl, urlToFileString } from "../url";

describe("normalizeUrl", () => {
  it("handles url that doesn't need encoding", () => {
    expect(escapeUnicodeUrl("https://www.mockdomain.com")).toEqual("https://www.mockdomain.com");
  });

  it("handles url that needs encoding", () => {
    expect(escapeUnicodeUrl("https://www.mockdomain.com/hello world")).toEqual(
      "https://www.mockdomain.com/hello%20world"
    );
  });

  it("handles url that is encoded", () => {
    expect(escapeUnicodeUrl("https://www.mockdomain.com/hello%20world")).toEqual(
      "https://www.mockdomain.com/hello%20world"
    );
  });

  it("handles url unicode characters", () => {
    expect(escapeUnicodeUrl("https://www.你好.com?query=世界")).toEqual(
      "https://www.%E4%BD%A0%E5%A5%BD.com?query=%E4%B8%96%E7%95%8C"
    );
  });
});

describe("urlToFilename", () => {
  it("throws on invalid URL", () => {
    expect(() => urlToFileString("/\\/\\/")).toThrowError();
  });

  it("encodes", () => {
    expect(urlToFileString("https://www.wikipedia.org/")).toBe(
      "www_wikipedia_org_72e64cabc23f9bf1054cea2b8ad8712cd8ded32b"
    );
  });

  it("handles long hostname", () => {
    const expectedMaxLength = 240;
    const longUrl = `https://www.${Array(1000).fill("z").join("")}.org/`;
    const actualHash = sha1(longUrl);
    const result = urlToFileString(longUrl);

    expect(result.length).toBe(expectedMaxLength);
    expect(result).toBe(
      `www_${Array(expectedMaxLength - 4 - 1 - actualHash.length)
        .fill("z")
        .join("")}_${actualHash}`
    );
  });
});
