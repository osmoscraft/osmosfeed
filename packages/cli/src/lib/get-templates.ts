import path from "path";
import { ENTRY_DIR } from "../utils/entry-dir";
import { readDirAsync, readFileAsync } from "../utils/fs";

export const INCLUDE_DIR = "includes";
export const SYSTEM_TEMPLATE_DIR = "system-templates";

export interface TemplateSummary {
  handlebarPartials: HandlebarPartial[];
}

export interface HandlebarPartial {
  name: string;
  template: string;
  source: PartialSource;
}

export type PartialSource = "user" | "system";

interface FileRequest {
  path: string;
  ext: string;
  filename: string;
  source: PartialSource;
}

/**
 * Detect and load templates.
 * User templates from "include" overwrites system templates from "src/system-templates".
 */
export async function getTemplates(): Promise<TemplateSummary> {
  const systemIncludeDir = path.resolve(ENTRY_DIR, SYSTEM_TEMPLATE_DIR);
  const systemIncludeFilenames = await readDirAsync(systemIncludeDir).catch(() => [] as string[]);

  const userIncludeDir = path.resolve(INCLUDE_DIR);
  const userIncludeFilenames = await readDirAsync(userIncludeDir).catch(() => [] as string[]);

  const convertUserFilenameToFileRequest = createFilenameToFileRequestFunction(userIncludeDir, "user");
  const convertSystemFilenameToFileRequest = createFilenameToFileRequestFunction(systemIncludeDir, "system");

  const templateFileRequests = [
    ...userIncludeFilenames.map(convertUserFilenameToFileRequest),
    ...systemIncludeFilenames.map(convertSystemFilenameToFileRequest),
  ]
    .reduce<FileRequest[]>(deduplicateFileRequests, [])
    .filter(filterToHandlebarTemplates);

  const handlebarPartials = (await Promise.all(templateFileRequests.map(getHandlebarPartialFromFile))).filter(
    (partial): partial is HandlebarPartial => partial !== null
  );

  return {
    handlebarPartials,
  };
}

function createFilenameToFileRequestFunction(dir: string, source: PartialSource) {
  return (filename: string) => ({
    path: path.join(dir, filename),
    ext: path.extname(filename).toLowerCase(),
    filename: filename,
    source,
  });
}

/**
 * A reducer that scans an array of file requests and removes duplicates based on filename (first-come-first-stay)
 */
function deduplicateFileRequests(fileRequests: FileRequest[], currentRequest: FileRequest) {
  if (!fileRequests.some((file) => file.filename === currentRequest.filename)) {
    fileRequests.push(currentRequest);
  }

  return fileRequests;
}

function filterToHandlebarTemplates(fileRequest: FileRequest) {
  return [".hbs"].includes(fileRequest.ext);
}

async function getHandlebarPartialFromFile(fileRequest: FileRequest): Promise<HandlebarPartial | null> {
  try {
    const fileContent = await readFileAsync(fileRequest.path, "utf-8");
    const partial = {
      name: fileRequest.filename.replace(".hbs", ""),
      template: fileContent,
      source: fileRequest.source,
    };
    console.log(`[template] Loaded ${fileRequest.source} template: ${fileRequest.path}`);
    return partial;
  } catch (e) {
    console.error(`[template] error loading ${fileRequest.path}`);
    return null;
  }
}
