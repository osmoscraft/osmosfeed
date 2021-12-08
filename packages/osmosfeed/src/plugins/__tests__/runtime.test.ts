import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { Plugins } from "../plugins";
import { run } from "../runtime";
import {
  mockFeedDescriptionPlugin,
  mockFeedPassthroughPlugin,
  mockFeedsAppendPlugin,
  mockFeedsEmptyPlugin,
  mockFeedsTitlePlugin,
} from "../__mocks__/mock-plugins";

describe("runtime/feeds", () => {
  it("runs on empty input", async () => {
    const plugins: Plugins = {};
    const jsonFeeds = await run(plugins);
    await expect(jsonFeeds).toEqual([]);
  });

  it("runs blank feeds plugin", async () => {
    const plugins: Plugins = {
      onFeeds: [mockFeedsEmptyPlugin],
    };
    const jsonFeeds = await run(plugins);
    await expect(jsonFeeds).toEqual([]);
  });

  it("runs generative feeds plugin", async () => {
    const plugins: Plugins = {
      onFeeds: [mockFeedsTitlePlugin],
    };
    const jsonFeeds = await run(plugins);
    await expect(jsonFeeds).toEqual([
      {
        title: "Simple title",
        items: [],
      },
    ]);
  });

  it("pipes feeds plugins", async () => {
    const plugins: Plugins = {
      onFeeds: [mockFeedsTitlePlugin, mockFeedsAppendPlugin],
    };
    const jsonFeeds = await run(plugins);
    await expect(jsonFeeds).toEqual([
      {
        title: "Simple title",
        items: [],
      },
      {
        title: "Appended title",
        items: [],
      },
    ]);
  });
});

describe("runtime/feed", () => {
  it("runs passthrough feed plugin", async () => {
    const plugins: Plugins = {
      onFeeds: [mockFeedsTitlePlugin],
      onFeed: [mockFeedPassthroughPlugin],
    };
    const jsonFeeds = await run(plugins);
    await expect(jsonFeeds).toEqual([
      {
        title: "Simple title",
        items: [],
      },
    ]);
  });

  it("runs simple feed plugin", async () => {
    const plugins: Plugins = {
      onFeeds: [mockFeedsTitlePlugin],
      onFeed: [mockFeedDescriptionPlugin],
    };
    const jsonFeeds = await run(plugins);
    await expect(jsonFeeds).toEqual([
      {
        title: "Simple title",
        description: "Simple description",
        items: [],
      },
    ]);
  });
});
