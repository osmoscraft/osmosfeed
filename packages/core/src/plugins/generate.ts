import { readFile, writeFile } from "fs/promises";
import Handlebars from "handlebars";
import { basename, extname, isAbsolute, join, relative } from "path";
import type { ProjectTask } from "../engine/build";
import { readdirDeep } from "./generate/fs-helper";
import { getAtomXml } from "./generate/get-atom-xml";
import { getTemplateData } from "./generate/get-template-data";
import type { Project } from "./types";

const ENTRY_BASENAME = "index";
export const ATOM_FILENAME = "feed.atom";
export const INDEX_FILENAME = "index.html";

export function generate(): ProjectTask<Project> {
  return async (project) => {
    const defaultDir = join(__dirname, "generate/default");
    const userDir = process.cwd();

    const [defaultTemplates, defaultStatic, userTemplates, userStatic] = await Promise.all([
      preloadDir(join(defaultDir, "templates"), templateFilter),
      preloadDir(join(defaultDir, "static")),
      preloadDir(join(userDir, "templates"), templateFilter),
      preloadDir(join(userDir, "static")),
    ]);

    const templates = mergeAssets(userTemplates, defaultTemplates);
    const statics = mergeAssets(userStatic, defaultStatic);

    console.log(
      `[generate] Active default files`,
      [...templates, ...statics].filter((f) => isParentChild(defaultDir, f.path)).map((t) => t.path)
    );

    console.log(
      `[generate] Active user files`,
      [...templates, ...statics].filter((f) => isParentChild(userDir, f.path)).map((t) => t.path)
    );

    await Promise.all(
      templates.map(async (templateFile) => {
        const template = templateFile;
        const text = await template.readAsync();
        Handlebars.registerPartial(template.baseName, text);
      })
    );

    const execTemplate = Handlebars.compile(`{{> ${ENTRY_BASENAME}}}`);
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

function templateFilter(file: PreloadedFile) {
  const TEMPLATE_EXT = [".hbs", ".html", ".htm"];
  return TEMPLATE_EXT.includes(file.extName);
}

interface PreloadedFile {
  path: string;
  relPath: string;
  baseName: string;
  extName: string;
  name: string;
  readAsync: () => Promise<string>;
}

function mergeAssets(userFiles: PreloadedFile[], sysFiles: PreloadedFile[]): PreloadedFile[] {
  return [...userFiles, ...sysFiles].filter(
    (file, index, existingFiles) =>
      index === existingFiles.findIndex((existingFile) => existingFile.relPath === file.relPath)
  );
}

async function preloadDir(dir: string, filter?: (file: PreloadedFile) => boolean): Promise<PreloadedFile[]> {
  try {
    return (await readdirDeep(dir)).map((path) => preload(path, dir)).filter(filter ?? (() => true));
  } catch (e) {
    if ((e as any)?.code === "ENOENT") {
      return [];
    } else {
      throw e;
    }
  }
}

function preload(relPath: string, baseDir: string): PreloadedFile {
  const ext = extname(relPath);
  const longPath = join(baseDir, relPath);

  return {
    path: longPath,
    relPath: relPath,
    name: basename(longPath),
    baseName: basename(longPath, ext),
    extName: ext,
    readAsync: () => readFile(longPath, "utf-8"),
  };
}

function isParentChild(parent: string, child: string) {
  const relativePath = relative(parent, child);
  return relativePath && !relativePath.startsWith("..") && !isAbsolute(relativePath);
}
