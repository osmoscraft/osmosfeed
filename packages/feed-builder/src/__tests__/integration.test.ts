import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { useHttpFeedDownloader, useInlineConfig, useJsonFeedParser } from "../plugins";
import { build } from "../runtime";
import { Plugin } from "../types";

// TODO replace this with individiual plugin tests
// TODO allow settings to change where plugin stores data, for testing

describe("Integration", () => {
  it("Loads a single feed", async () => {
    const plugins: Plugin[] = [
      useInlineConfig({ sources: [{ url: "https://css-tricks.com/feed/" }] }),
      useHttpFeedDownloader(),
      useJsonFeedParser(),
      // useIncrementalFeedStorage(),
    ];

    // TODO expose all fs and network event in callbacks in the main build function
    // Consumer API should look like:
    // ```
    // build({ plugins, eventHandlers: [httpHandler, fsHandler] })
    // ```

    const result = await build({ plugins });

    await expect(result.feeds?.[0]?.home_page_url).toEqual("https://css-tricks.com");
    await expect(result.errors).toEqual(undefined);
  });
});
