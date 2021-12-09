import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { FeedFormatError, ProjectConfigError, build } from "../feed-builder";
import { Plugins } from "../sdk";

describe("Runtime", () => {
  it("Throws ProjectConfig error when plugins do not resolve full config", async () => {
    const plugins: Plugins = {
      configPlugins: [],
    };

    await expect(() => build({ plugins })).toThrow(ProjectConfigError);
  });

  it("Throws FeedFormat error when plugins do not resolve full feed", async () => {
    const plugins: Plugins = {
      configPlugins: [
        async () => ({
          sources: [
            {
              url: "",
            },
          ],
        }),
      ],
    };

    await expect(() => build({ plugins })).toThrow(FeedFormatError);
  });

  it("Executes plugins in config > feed > item order", async () => {
    const invocationTracker: string[] = [];
    const plugins: Plugins = {
      configPlugins: [
        async () => {
          invocationTracker.push("s1");
          return {};
        },
        async () => {
          invocationTracker.push("s2");
          return {
            sources: [{ url: "" }],
          };
        },
      ],
      feedPlugins: [
        async () => {
          invocationTracker.push("f1");
          return {};
        },
        async () => {
          invocationTracker.push("f2");
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
      ],
      itemPlugins: [
        async ({ item }) => {
          invocationTracker.push("i1");
          return { ...item };
        },
        async ({ item }) => {
          invocationTracker.push("i2");
          return { ...item };
        },
      ],
    };

    await build({ plugins });

    await expect(invocationTracker).toEqual(["s1", "s2", "f1", "f2", "i1", "i2"]);
  });
});
