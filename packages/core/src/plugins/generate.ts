import { readFile } from "fs/promises";
import Handlebars from "handlebars";
import { basename, extname, join } from "path";
import type { ProjectTask } from "../runtime";
import { readdirDeep } from "./generate/fs-helper";
import type { Project } from "./types";

const ENTRY_TEMPLATE_NAME = "index";
export const FEED_FILENAME = "feed.atom";

export function generate(): ProjectTask<Project> {
  return async (project) => {
    const { templateFiles, staticFiles } = await discoverSystemAssets(join(__dirname, "generate/assets"));
    console.log(`[generate] System templates: ${templateFiles.length} files`);
    console.log(`[generate] System static: ${staticFiles.length} files`);

    await Promise.all(
      templateFiles.map(async (templateFile) => {
        const template = await templateFile;
        const text = await template.readAsync();
        Handlebars.registerPartial(template.baseName, text);
        console.log(`[generate] Template registered: ${template.baseName}`);
      })
    );

    const execTemplate = Handlebars.compile(`{{> ${ENTRY_TEMPLATE_NAME}}}`);
    console.log(execTemplate({}));

    return project;
  };
}

async function discoverSystemAssets(assetsDir: string) {
  const templateDir = join(assetsDir, "templates");
  const templatePaths = (await readdirDeep(templateDir)).filter((file) => extname(file) === ".hbs");
  const templateFiles = templatePaths.map((file) => join(templateDir, file)).map(preloadFile);

  const staticDir = join(assetsDir, "static");
  const staticPaths = await readdirDeep(staticDir);
  const staticFiles = staticPaths.map((file) => join(staticDir, file)).map(preloadFile);

  return {
    templateFiles,
    staticFiles,
  };
}

async function preloadFile(path: string) {
  const ext = extname(path);

  return {
    path,
    baseName: basename(path, ext),
    extname: ext,
    readAsync: async () => await readFile(path, "utf-8"),
  };
}
