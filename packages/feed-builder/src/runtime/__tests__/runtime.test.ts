import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { FeedFormatError, ProjectConfigError } from "../lib/error-types";
import { build } from "..";
import { Plugin } from "../../types";

describe("Runtime", () => {
  it("Throws ProjectConfig error when plugins do not resolve full config", async () => {
    const result = await build({ plugins: [] });

    await expect(result.errors?.[0] instanceof ProjectConfigError).toEqual(true);
  });

  it("Throws FeedFormat error when plugins do not resolve full feed", async () => {
    const plugin: Plugin = {
      id: "test-id",
      name: "Test Plugin",
      config: async () => ({
        sources: [
          {
            url: "",
          },
        ],
      }),
    };

    const result = await build({ plugins: [plugin] });

    await expect(result.errors?.[0] instanceof FeedFormatError).toEqual(true);
  });

  it("Executes plugins in config > feed > item > buildEnd order", async () => {
    const invocationTracker: string[] = [];
    const plugin: Plugin = {
      id: "test-id",
      name: "Test Plugin",
      config: async () => {
        invocationTracker.push("s1");
        return {
          sources: [{ url: "" }],
        };
      },
      transformFeed: async () => {
        invocationTracker.push("f1");
        return {
          version: "",
          title: "",
          items: [
            {
              id: "0",
            },
          ],
        };
      },
      transformItem: async ({ data }) => {
        invocationTracker.push("i1");
        return { ...data.item };
      },
      buildEnd: async ({ data }) => {
        invocationTracker.push("be1");
        return { ...data };
      },
    };

    await build({ plugins: [plugin] });

    await expect(invocationTracker).toEqual(["s1", "f1", "i1", "be1"]);
  });

  it("pipes data through all plugins", async () => {
    const plugin1: Plugin = {
      id: "test-plugin-id-1",
      name: "Test Plugin 1",
      config: async () => {
        return {
          sources: [{ url: "s1" }],
        };
      },
      transformFeed: async ({ data }) => {
        return {
          title: data.sourceConfig.url + "f1",
        };
      },
      transformItem: async ({ data }) => {
        return { ...data.item, title: data.feed.title + "i1" };
      },
    };

    const plugin2: Plugin = {
      id: "test-plugin-id-2",
      name: "Test Plugin 2",
      config: async ({ data }) => {
        return {
          sources: [{ url: data.config.sources![0].url + "s2" }],
        };
      },
      transformFeed: async ({ data }) => {
        return {
          version: "",
          title: data.feed.title! + "f2",
          items: [
            {
              id: "0",
            },
          ],
        };
      },
      transformItem: async ({ data }) => {
        return { ...data.item, title: data.item.title! + "i2" };
      },
      buildEnd: async ({ data }) => {
        return {
          ...data,
          feeds: data.feeds.map((feed) => ({
            ...feed,
            items: feed.items.map((item) => ({
              ...item,
              title: item.title + "be1",
            })),
          })),
        };
      },
    };

    const jsonFeed = await build({ plugins: [plugin1, plugin2] });
    await expect(jsonFeed.feeds![0].items[0].title).toEqual("s1s2f1f2i1i2be1");
  });
});
