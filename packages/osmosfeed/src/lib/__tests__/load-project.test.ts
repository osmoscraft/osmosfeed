import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { loadProject } from "../load-project";
import path from "path";

describe("loadProject", () => {
  it("Throws when project has no config file", async () => {
    await expect(() => loadProject([])).toThrow();
  });

  it("Loads config file", async () => {
    await expect(() =>
      loadProject([
        {
          filename: "osmosfeed.yml",
          extension: ".yml",
          path: path.resolve(__dirname, "../__fixtures__/configs/valid/osmosfeed.yml"),
        },
      ])
    ).not.toThrow();
  });

  it("Loads channel url from config file", async () => {
    const projectFiles = await loadProject([
      {
        filename: "osmosfeed.yml",
        extension: ".yml",
        path: path.resolve(__dirname, "../__fixtures__/configs/valid/osmosfeed.yml"),
      },
    ]);
    await expect(projectFiles.config.sources.length).toEqual(1);
    await expect(projectFiles.config.sources[0].url).toEqual("https://test-domain.com/feed.xml");
  });
});
