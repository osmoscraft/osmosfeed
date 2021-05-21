import path from "path";
import { ENTRY_DIR } from "../utils/entry-dir";
import { readDirAsync, readFileAsync } from "../utils/fs";

const CONFIG_FILENAME = "osmosfeed.yaml";
const SYSTEM_TEMPLATE_DIR = "system-templates";
const SYSTEM_STATIC_DIR = "system-static";

const CACHE_FILENAME = "cache.json";
const PUBLIC_ROOT_DIR = "public";

export interface SystemFiles {
  configFile: ParsableFile | null;
  localCacheFile: ParsableFile | null;
  systemStaticFiles: PassthroughFile[];
  systemTemplateFiles: ParsableFile[];
}

export interface ParsableFile extends PassthroughFile {
  rawText: string;
}

export interface PassthroughFile {
  filename: string;
  extension: string;
  path: string;
}

export async function loadSystemFiles(): Promise<SystemFiles> {
  const configFile = await getParsableFile(path.resolve(CONFIG_FILENAME)).catch(() => null);
  const localCacheFile = await getParsableFile(path.resolve(PUBLIC_ROOT_DIR, CACHE_FILENAME)).catch(() => null);
  const systemStaticFiles = await getPassthroughFilesInDirDeep(path.resolve(ENTRY_DIR, SYSTEM_STATIC_DIR));
  const systemTemplateFiles = await getParsableFilesInDirShallow(path.resolve(ENTRY_DIR, SYSTEM_TEMPLATE_DIR));

  return {
    configFile,
    localCacheFile,
    systemStaticFiles,
    systemTemplateFiles,
  };
}

async function getParsableFile(filePath: string): Promise<ParsableFile> {
  const rawText = await readFileAsync(filePath, "utf-8");
  return {
    filename: path.basename(filePath),
    extension: path.extname(filePath).toLowerCase(),
    path: filePath,
    rawText,
  };
}

async function getPassthroughFilesInDirShallow(dir: string): Promise<PassthroughFile[]> {
  const filenames = await readDirAsync(dir);
  return filenames.map((filename) => ({
    filename,
    extension: path.extname(filename).toLowerCase(),
    path: path.join(dir, filename),
  }));
}

async function getParsableFilesInDirShallow(dir: string): Promise<ParsableFile[]> {
  const passthroughFiles = await getPassthroughFilesInDirShallow(dir);
  return Promise.all(
    passthroughFiles.map(async (file) => {
      return {
        ...file,
        rawText: await readFileAsync(file.path, "utf-8"),
      };
    })
  );
}

async function getPassthroughFilesInDirDeep(dir: string): Promise<PassthroughFile[]> {
  // TODO implement
  return [];
}
