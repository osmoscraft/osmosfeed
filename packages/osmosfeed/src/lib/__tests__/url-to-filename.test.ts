import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { urlToFilename } from "../url-to-filename";

describe("urlToFilename", () => {
  it("Throws on non-URL input", async () => {
    await expect(() => urlToFilename("not-a-url!")).not.toThrow();
  });

  it("produces 64 character string", async () => {
    const output1 = urlToFilename("http://test.com");
    await expect(output1.length).toEqual(64);
  });

  it("Hashes differently for different URLs", async () => {
    const output1 = urlToFilename("http://site1.com");
    const output2 = urlToFilename("http://site2.com");
    await expect(output1).not.toEqual(output2);
  });
});
