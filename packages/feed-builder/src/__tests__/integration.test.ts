import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { build } from "../runtime/runtime";
import { useHttpFeedDownloader, useInlineConfig, useJsonFeedParser } from "../plugins/core";
import { Plugins } from "../plugins/sdk";

describe("Integration", () => {
  it("Loads a single feed", async () => {
    const plugins: Plugins = {
      configPlugins: [useInlineConfig({ sources: [{ url: "https://css-tricks.com/feed/" }] })],
      feedPlugins: [useHttpFeedDownloader(), useJsonFeedParser()],
    };

    const result = await build({ plugins });

    await expect(result.feeds?.[0]?.home_page_url).toEqual("https://css-tricks.com");
    await expect(result.errors).toEqual(undefined);
  });
});
