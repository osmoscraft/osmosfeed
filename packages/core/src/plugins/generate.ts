import { copyFile, readFile, writeFile } from "fs/promises";
import Handlebars from "handlebars";
import { basename, dirname, extname, join } from "path";
import type { ProjectTask } from "../engine/build";
import { md5 } from "../utils/hash";
import { readdirDeep } from "./generate/fs-helper";
import { getTemplateData } from "./generate/get-template-data";
import type { Project } from "./types";

export const ATOM_FILENAME = "atom.xml";
export const INDEX_FILENAME = "index.html";
const HTML_TEMPLATE_NAME = "index";
const ATOM_TEMPLATE_NAME = "atom";
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

    await Promise.all(defaultStatics.map((staticFile) => copyFile(staticFile.path, `dist/${staticFile.relPath}`)));
    console.log(
      `[generate] default static`,
      defaultStatics.map((t) => t.path)
    );
    await Promise.all(userStatic.map((staticFile) => copyFile(staticFile.path, `dist/${staticFile.relPath}`)));
    console.log(
      `[generate] user static`,
      userStatic.map((t) => t.path)
    );

    const staticDirHash = await getDirHash([...defaultStatics, ...userStatic]);
    console.log(`[generate] static files hash: ${staticDirHash}`);

    await registerTemplates(defaultTemplates);
    console.log(
      `[generate] default templates`,
      defaultTemplates.map((t) => t.path)
    );
    await registerTemplates(userTemplates);
    console.log(
      `[generate] user templates`,
      userTemplates.map((t) => t.path)
    );

    const atomTemplate = Handlebars.compile(` {{> ${ATOM_TEMPLATE_NAME}}}`);
    const htmlTemplate = Handlebars.compile(`{{> ${HTML_TEMPLATE_NAME}}}`);
    const templateData = getTemplateData(project, staticDirHash);

    const atomString = atomTemplate(templateData).trim();
    await writeFile(join(process.cwd(), `dist/${ATOM_FILENAME}`), atomString);
    console.log(`[generate] generated atom: ${ATOM_FILENAME}`);

    const htmlString = htmlTemplate(templateData).trim();
    await writeFile(join(process.cwd(), `dist/${INDEX_FILENAME}`), htmlString);
    console.log(`[generate] generated html: ${INDEX_FILENAME}`);

    return project;
  };
}

async function getDirHash(files: PreloadedFile[]) {
  const md5List = await Promise.all(files.map(async (file) => md5(file.relPath + (await file.readAsync()))));
  return md5(md5List.join(""));
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
