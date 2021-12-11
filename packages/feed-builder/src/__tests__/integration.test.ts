import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { useHttpFeedDownloader, useInlineConfig, useJsonFeedParser } from "../plugins";
import { build } from "../runtime";
import { Plugin } from "../types";

describe("Integration", () => {
  it("Loads a single feed", async () => {
    const plugins: Plugin[] = [
      useInlineConfig({ sources: [{ url: "https://css-tricks.com/feed/" }] }),
      useHttpFeedDownloader(),
      useJsonFeedParser(),
      // useIncrementalFeedStorage(),
    ];

    const result = await build({ plugins });

    await expect(result.feeds?.[0]?.home_page_url).toEqual("https://css-tricks.com");
    await expect(result.errors).toEqual(undefined);
  });
});
