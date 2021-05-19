import path from "path";
import { FileRequest, getExtensionsFilter, getFilenameToFileRequestConverter } from "../utils/file-request";
import { readDirAsync, readFileAsync } from "../utils/fs";

export const INCLUDE_DIR = "includes";

export interface UserSnippetsSummary {
  userSnippets: UserSnippet[];
}

export interface UserSnippet {
  replaceFrom: string;
  replaceTo: string;
}

/**
 * Detect and load any custom HTML snippet from the `includes` dir.
 * TODO: rename from `includes` to `snippets` in next major release.
 */
export async function userSnippets(): Promise<UserSnippetsSummary> {
  const includeDir = path.resolve(INCLUDE_DIR);
  const includeFilenames = await readDirAsync(includeDir).catch(() => [] as string[]);

  const convertFilenameToFileRequest = getFilenameToFileRequestConverter(includeDir);

  const snippetRequests = includeFilenames
    .map(convertFilenameToFileRequest)
    .filter(getExtensionsFilter([".html", ".htm"]));

  const includeSnippets = (await Promise.all(snippetRequests.map(getUserSnippetFromFile))).filter(
    (snippet): snippet is UserSnippet => snippet !== null
  );

  return {
    userSnippets: includeSnippets,
  };
}

async function getUserSnippetFromFile(fileRequest: FileRequest): Promise<UserSnippet | null> {
  try {
    const fileContent = await readFileAsync(fileRequest.path, "utf-8");
    const snippet = {
      replaceFrom: `<!-- %${fileRequest.filename}% -->`,
      replaceTo: fileContent,
    };
    console.log(`[snippets] Loaded ${fileRequest.path}`);
    return snippet;
  } catch (e) {
    console.error(`[snippets] error loading ${fileRequest.path}`);
    return null;
  }
}
