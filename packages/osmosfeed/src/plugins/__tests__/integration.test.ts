import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { useHttpFeedDownload } from "../core/http-feed-download";
import { useInlineConfig } from "../core/inline-config";
import { useJsonFeedParser } from "../core/json-feed-parser";
import { build } from "../feed-builder";
import { Plugins } from "../sdk";

describe("Integration", () => {
  it("Loads a single feed", async () => {
    const plugins: Plugins = {
      configPlugins: [useInlineConfig({ sources: [{ url: "https://css-tricks.com/feed/" }] })],
      feedPlugins: [useHttpFeedDownload(), useJsonFeedParser()],
    };

    const result = await build({ plugins });

    await expect(result?.[0]?.home_page_url).toEqual("https://css-tricks.com");
  });
});
