import path from "path";
import { ENTRY_DIR } from "../utils/entry-dir";
import { readDirAsync, readDirDeepAsync, readFileAsync } from "../utils/fs";
import {
  CACHE_FILENAME,
  CONFIG_FILENAME,
  PUBLIC_ROOT_DIR,
  SYSTEM_STATIC_DIR,
  SYSTEM_TEMPLATE_DIR,
  USER_SNIPPET_DIR,
  USER_STATIC_DIR,
  USER_TEMPLATE_DIR,
} from "./path-constants";

const USER_TEMPLATE_EXTENSIONS = [".hbs"];
const USER_SNIPPET_EXTENSIONS = [".html"];

export interface SystemFiles {
  configFile: ParsableFile | null;
  localCacheFile: ParsableFile | null;
  systemStaticFiles: PassthroughFile[];
  systemTemplateFiles: ParsableFile[];
  systemTemplateStaticFiles: PassthroughFile[];
}

export interface ParsableFile extends PassthroughFile {
  rawText: string;
}

export interface PassthroughFile {
  filename: string;
  extension: string;
  path: string;
}

const systemStaticFileList = ["favicon.ico"];

export async function discoverSystemFiles(): Promise<SystemFiles> {
  const configFile = await getParsableFile(path.resolve(CONFIG_FILENAME)).catch(() => null);
  console.log(`[system-file] Config: ${configFile?.path}`);

  const localCacheFile = await getParsableFile(path.resolve(PUBLIC_ROOT_DIR, CACHE_FILENAME)).catch(() => null);
  console.log(`[system-file] Local cache: ${localCacheFile?.path}`);

  const systemTemplateFiles = await getParsableFilesInDirShallow(path.resolve(ENTRY_DIR, SYSTEM_TEMPLATE_DIR));
  systemTemplateFiles.forEach((file) => console.log(`[system-file] Template: ${file.path}`));

  const allStaticFiles = await getPassthroughFilesInDirDeep(path.resolve(ENTRY_DIR, SYSTEM_STATIC_DIR));

  const systemStaticFiles = allStaticFiles.filter((file) => systemStaticFileList.includes(file.filename));
  systemStaticFiles.forEach((file) => console.log(`[system-file] System static: ${file.path}`));

  const systemTemplateStaticFiles = allStaticFiles.filter((file) => !systemStaticFileList.includes(file.filename));
  systemTemplateStaticFiles.forEach((file) => console.log(`[system-file] System template static: ${file.path}`));

  return {
    configFile,
    localCacheFile,
    systemStaticFiles,
    systemTemplateFiles,
    systemTemplateStaticFiles,
  };
}

export interface UserFiles {
  userStaticFiles: PassthroughFile[];
  userTemplateFiles: ParsableFile[];
  userSnippetFiles: ParsableFile[];
}

export async function discoverUserFiles(): Promise<UserFiles> {
  const userStaticFiles = await getPassthroughFilesInDirDeep(path.resolve(USER_STATIC_DIR)).catch(() => []);
  userStaticFiles.forEach((file) => console.log(`[user-file] Static: ${file.path}`));

  const userTemplateFiles = (
    await getParsableFilesInDirShallow(path.resolve(USER_TEMPLATE_DIR)).catch(() => [])
  ).filter(allowTemplateExt);
  userTemplateFiles.forEach((file) => console.log(`[user-file] Template: ${file.path}`));

  const userSnippetFiles = (await getParsableFilesInDirShallow(path.resolve(USER_SNIPPET_DIR)).catch(() => [])).filter(
    allowSnippetExt
  );
  userSnippetFiles.forEach((file) => console.log(`[user-file] Snippet: ${file.path}`));

  return {
    userSnippetFiles,
    userStaticFiles,
    userTemplateFiles,
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
  const filenames = await readDirDeepAsync(dir);
  return filenames.map((filename) => ({
    filename,
    extension: path.extname(filename).toLowerCase(),
    path: path.join(dir, filename),
  }));
}

const allowTemplateExt = getExtensionsFilter(USER_TEMPLATE_EXTENSIONS);
const allowSnippetExt = getExtensionsFilter(USER_SNIPPET_EXTENSIONS);

export interface FileRequestFilter {
  (request: FileWithExtension): boolean;
}

export interface FileWithExtension {
  extension: string;
}

/**
 * Get a filter function to be used against an array of FileRequest.
 * Each allowed extension string must start with dot, e.g. `.txt`, `.html`
 */
export function getExtensionsFilter(allowedExtensions: string[]): FileRequestFilter {
  return (request: FileWithExtension) => allowedExtensions.includes(request.extension);
}
