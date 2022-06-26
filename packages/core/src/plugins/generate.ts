import { readFile, writeFile } from "fs/promises";
import Handlebars from "handlebars";
import { basename, extname, join } from "path";
import type { ProjectTask } from "../engine/build";
import { readdirDeep } from "./generate/fs-helper";
import { getAtomXml } from "./generate/get-atom-xml";
import { getTemplateData } from "./generate/get-template-data";
import type { Project } from "./types";

const ENTRY_TEMPLATE_NAME = "index";
export const ATOM_FILENAME = "feed.atom";
export const INDEX_FILENAME = "index.html";

export function generate(): ProjectTask<Project> {
  return async (project) => {
    const { templateFiles: sysTempaltes, staticFiles: sysStatics } = await discoverAssets(
      join(__dirname, "generate/assets")
    );
    const { templateFiles: userTempaltes, staticFiles: userStatics } = await discoverAssets(process.cwd());

    await Promise.all(
      sysTempaltes.map(async (templateFile) => {
        const template = await templateFile;
        const text = await template.readAsync();
        Handlebars.registerPartial(template.baseName, text);
      })
    );

    const execTemplate = Handlebars.compile(`{{> ${ENTRY_TEMPLATE_NAME}}}`);
    const templateData = getTemplateData(project);
    const htmlString = execTemplate(templateData);

    await writeFile(join(process.cwd(), `dist/${INDEX_FILENAME}`), htmlString);

    if (project.githubPageUrl) {
      const atomString = getAtomXml(project);
      await writeFile(join(process.cwd(), `dist/${ATOM_FILENAME}`), atomString);
    } else {
      console.log(`[generate] githubPageUrl missing. Skip atom feed generation`);
    }

    return project;
  };
}

async function discoverAssets(assetsDir: string) {
  const templateDir = join(assetsDir, "templates");
  const templatePaths = (await readdirDeep(templateDir)).filter((file) => extname(file) === ".hbs");
  const templateFiles = Promise.all(templatePaths.map((file) => join(templateDir, file)).map(preload));

  const staticDir = join(assetsDir, "static");
  const staticPaths = await readdirDeep(staticDir);
  const staticFiles = Promise.all(staticPaths.map((file) => join(staticDir, file)).map(preload));

  const [templatePreloads, staticPreloads] = await Promise.all([templateFiles, staticFiles]);

  return {
    templateFiles: templatePreloads,
    staticFiles: staticPreloads,
  };
}

interface PreloadedFile {
  path: string;
  baseName: string;
  extName: string;
  name: string;
  readAsync: () => Promise<string>;
}

async function preloadDir(dir: string, filter?: (file: PreloadedFile) => boolean): Promise<PreloadedFile[]> {
  return (await readdirDeep(dir)).map(preload).filter(filter ?? (() => true));
}

function preload(path: string): PreloadedFile {
  const ext = extname(path);

  return {
    path,
    name: basename(path),
    baseName: basename(path, ext),
    extName: ext,
    readAsync: () => readFile(path, "utf-8"),
  };
}
