import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { FeedFormatError, ProjectConfigError } from "../runtime/lib/error-types";
import { build } from "../runtime/runtime";
import { Plugin } from "../types/plugins";

describe("Runtime", () => {
  it("Throws ProjectConfig error when plugins do not resolve full config", async () => {
    const result = await build({ plugins: [] });

    await expect(result.errors?.[0] instanceof ProjectConfigError).toEqual(true);
  });

  it("Throws FeedFormat error when plugins do not resolve full feed", async () => {
    const plugin: Plugin = {
      id: "test-id",
      onConfig: async () => ({
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

  it("Executes plugins in config > feed > item order", async () => {
    const invocationTracker: string[] = [];
    const plugin: Plugin = {
      id: "test-id",
      onConfig: async () => {
        invocationTracker.push("s1");
        return {
          sources: [{ url: "" }],
        };
      },
      onFeed: async () => {
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
      onItem: async ({ item }) => {
        invocationTracker.push("i1");
        return { ...item };
      },
    };

    await build({ plugins: [plugin] });

    await expect(invocationTracker).toEqual(["s1", "f1", "i1"]);
  });

  it("pipes data through all plugins", async () => {
    const plugin1: Plugin = {
      id: "test-plugin-id-1",
      onConfig: async () => {
        return {
          sources: [{ url: "s1" }],
        };
      },
      onFeed: async ({ data }) => {
        return {
          title: data.sourceConfig.url + "f1",
        };
      },
      onItem: async ({ item, feed }) => {
        return { ...item, title: feed.title + "i1" };
      },
    };

    const plugin2: Plugin = {
      id: "test-plugin-id-2",
      onConfig: async ({ config }) => {
        return {
          sources: [{ url: config.sources![0].url + "s2" }],
        };
      },
      onFeed: async ({ data }) => {
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
      onItem: async ({ item }) => {
        return { ...item, title: item.title! + "i2" };
      },
    };

    const jsonFeed = await build({ plugins: [plugin1, plugin2] });
    await expect(jsonFeed.feeds![0].items[0].title).toEqual("s1s2f1f2i1i2");
  });
});
