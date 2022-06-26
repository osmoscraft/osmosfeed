import { copyFile, readFile, writeFile } from "fs/promises";
import Handlebars from "handlebars";
import { basename, dirname, extname, join } from "path";
import type { ProjectTask } from "../engine/build";
import { readdirDeep } from "./generate/fs-helper";
import { getAtomXml } from "./generate/get-atom-xml";
import { getTemplateData } from "./generate/get-template-data";
import type { Project } from "./types";

export const ATOM_FILENAME = "feed.atom";
export const INDEX_FILENAME = "index.html";
const ENTRY_BASENAME = "index";
const TEMPLATE_EXT = [".hbs", ".html", ".htm"];

export function generate(): ProjectTask<Project> {
  return async (project) => {
    const defaultDir = join(__dirname, "generate/default");
    const userDir = process.cwd();

    const [sysTemplates, sysStatic, userTemplates, userStatic] = await Promise.all([
      preloadDir(join(defaultDir, "templates"), templateFilter),
      preloadDir(join(defaultDir, "static")),
      preloadDir(join(userDir, "templates"), templateFilter),
      preloadDir(join(userDir, "static")),
    ]);

    const defaultTemplates = excludeFrom(sysTemplates, userTemplates, true);
    const defaultStatics = excludeFrom(sysStatic, userStatic);

    await registerTemplates(defaultTemplates);
    console.log(
      `[generate] Default templates`,
      defaultTemplates.map((t) => t.path)
    );
    await registerTemplates(userTemplates);
    console.log(
      `[generate] User templates`,
      userTemplates.map((t) => t.path)
    );

    const execTemplate = Handlebars.compile(`{{> ${ENTRY_BASENAME}}}`);
    const templateData = getTemplateData(project);
    const htmlString = execTemplate(templateData);

    await Promise.all(defaultStatics.map((staticFile) => copyFile(staticFile.path, `dist/${staticFile.relPath}`)));
    console.log(
      `[generate] Default static`,
      defaultStatics.map((t) => t.path)
    );
    await Promise.all(userStatic.map((staticFile) => copyFile(staticFile.path, `dist/${staticFile.relPath}`)));
    console.log(
      `[generate] User static`,
      userStatic.map((t) => t.path)
    );

    if (project.githubPageUrl) {
      const atomString = getAtomXml(project);
      await writeFile(join(process.cwd(), `dist/${ATOM_FILENAME}`), atomString);
      console.log(`[generate] ${ATOM_FILENAME}`);
    } else {
      console.log(`[generate] githubPageUrl missing. Skip atom feed generation`);
    }

    await writeFile(join(process.cwd(), `dist/${INDEX_FILENAME}`), htmlString);
    console.log(`[generate] Generated site root: ${INDEX_FILENAME}`);

    return project;
  };
}

async function registerTemplates(handlebarFiles: PreloadedFile[]) {
  await Promise.all(
    handlebarFiles.map(async (handlebarFile) => {
      const template = handlebarFile;
      const text = await template.readAsync();
      Handlebars.registerPartial(template.baseName, text);
    })
  );
}

function templateFilter(file: PreloadedFile) {
  return TEMPLATE_EXT.includes(file.extName);
}

interface PreloadedFile {
  path: string;
  relPath: string;
  relBaseNamePath: string;
  baseName: string;
  extName: string;
  name: string;
  readAsync: () => Promise<string>;
}

function excludeFrom(all: PreloadedFile[], excludes: PreloadedFile[], ignoreExt = false) {
  const compareField = ignoreExt ? "relBaseNamePath" : "relPath";
  return all.filter((candidate) => excludes.every((exclude) => exclude[compareField] !== candidate[compareField]));
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
  const baseName = basename(longPath, ext);

  return {
    path: longPath,
    relPath,
    relBaseNamePath: join(dirname(relPath), baseName),
    name: basename(longPath),
    baseName: baseName,
    extName: ext,
    readAsync: () => readFile(longPath, "utf-8"),
  };
}
