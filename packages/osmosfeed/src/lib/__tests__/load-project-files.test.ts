import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { loadProjectFiles } from "../load-project-files";
import path from "path";

describe("load-project-files", () => {
  it("Throws when project dir doesn't exist", async () => {
    await expect(() => loadProjectFiles("./non-exist-dir")).toThrow();
  });

  it("Throws when project has no config file", async () => {
    const project1Dir = path.resolve(__dirname, "../__fixtures__/project-1");
    console.log(project1Dir);
    await expect(() => loadProjectFiles(project1Dir)).toThrow();
  });

  it("Throws when project has no config file", async () => {
    const project1Dir = path.resolve(__dirname, "../__fixtures__/project-1");
    console.log(project1Dir);
    await expect(() => loadProjectFiles(project1Dir)).toThrow();
  });

  it("Loads config file", async () => {
    const project1Dir = path.resolve(__dirname, "../__fixtures__/project-1");
    console.log(project1Dir);
    await expect(() => loadProjectFiles(project1Dir)).toThrow();
  });
});
