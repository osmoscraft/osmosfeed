import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { loadProject } from "../load-project";
import path from "path";

describe("load-project-files", () => {
  it("Throws when project dir doesn't exist", async () => {
    await expect(() => loadProject("./non-exist-dir")).toThrow();
  });

  it("Throws when project has no config file", async () => {
    const projectDir = path.resolve(__dirname, "../__fixtures__/project-1");
    await expect(() => loadProject(projectDir)).toThrow();
  });

  it("Throws when project has no config file", async () => {
    const projectDir = path.resolve(__dirname, "../__fixtures__/project-1");
    await expect(() => loadProject(projectDir)).toThrow();
  });

  it("Loads config file", async () => {
    const projectDir = path.resolve(__dirname, "../__fixtures__/project-2");
    await expect(() => loadProject(projectDir)).not.toThrow();
  });

  it("Loads channel url from config file", async () => {
    const projectDir = path.resolve(__dirname, "../__fixtures__/project-2");
    const projectFiles = await loadProject(projectDir);
    await expect(projectFiles.config.content.channels.length).toEqual(1);
    await expect(projectFiles.config.content.channels[0].url).toEqual("https://test-domain.com/feed.xml");
  });
});
