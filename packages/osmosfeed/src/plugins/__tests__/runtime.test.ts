import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { Plugins } from "../plugins";
import { run } from "../runtime";
import {
  mockFeedDescriptionPlugin,
  mockFeedPassthroughPlugin,
  mockSourcesAppendPlugin,
  mockSourcesEmptyPlugin,
  mockSourcesTitlePlugin,
} from "../__mocks__/mock-plugins";

describe("runtime/feeds", () => {
  it("runs on empty input", async () => {
    const plugins: Plugins = {};
    const jsonFeeds = await run(plugins);
    await expect(jsonFeeds).toEqual([]);
  });

  it("runs blank feeds plugin", async () => {
    const plugins: Plugins = {
      onSources: [mockSourcesEmptyPlugin],
    };
    const jsonFeeds = await run(plugins);
    await expect(jsonFeeds).toEqual([]);
  });

  it("runs generative feeds plugin", async () => {
    const plugins: Plugins = {
      onSources: [mockSourcesTitlePlugin],
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
      onSources: [mockSourcesTitlePlugin, mockSourcesAppendPlugin],
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
      onSources: [mockSourcesTitlePlugin],
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
      onSources: [mockSourcesTitlePlugin],
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
