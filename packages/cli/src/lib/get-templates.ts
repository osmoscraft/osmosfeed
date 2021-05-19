import path from "path";
import { ENTRY_DIR } from "../utils/entry-dir";
import { FileRequest, getExtensionsFilter, getFilenameToFileRequestConverter } from "../utils/file-request";
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

interface TemplateDetails {
  source: PartialSource;
}
type TemplateRequest = FileRequest<TemplateDetails>;

/**
 * Detect and load templates.
 * User templates from "include" overwrites system templates from "src/system-templates".
 */
export async function getTemplates(): Promise<TemplateSummary> {
  const systemIncludeDir = path.resolve(ENTRY_DIR, SYSTEM_TEMPLATE_DIR);
  const systemIncludeFilenames = await readDirAsync(systemIncludeDir).catch(() => [] as string[]);

  const userIncludeDir = path.resolve(INCLUDE_DIR);
  const userIncludeFilenames = await readDirAsync(userIncludeDir).catch(() => [] as string[]);

  const convertUserFilenameToFileRequest = getFilenameToFileRequestConverter<TemplateDetails>(userIncludeDir, {
    source: "user",
  });
  const convertSystemFilenameToFileRequest = getFilenameToFileRequestConverter<TemplateDetails>(systemIncludeDir, {
    source: "system",
  });

  const templateFileRequests = [
    ...userIncludeFilenames.map(convertUserFilenameToFileRequest),
    ...systemIncludeFilenames.map(convertSystemFilenameToFileRequest),
  ]
    .reduce<TemplateRequest[]>(deduplicateFileRequests, [])
    .filter(getExtensionsFilter([".hbs"]));

  const handlebarPartials = (await Promise.all(templateFileRequests.map(getHandlebarPartialFromFile))).filter(
    (partial): partial is HandlebarPartial => partial !== null
  );

  return {
    handlebarPartials,
  };
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

async function getHandlebarPartialFromFile(fileRequest: TemplateRequest): Promise<HandlebarPartial | null> {
  try {
    const fileContent = await readFileAsync(fileRequest.path, "utf-8");
    const partial = {
      name: fileRequest.filename.replace(".hbs", ""),
      template: fileContent,
      source: fileRequest.details.source,
    };
    console.log(`[template] Loaded ${fileRequest.details.source} template: ${fileRequest.path}`);
    return partial;
  } catch (e) {
    console.error(`[template] error loading ${fileRequest.path}`);
    return null;
  }
}
