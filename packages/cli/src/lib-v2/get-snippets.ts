import type { ParsableFile } from "./discover-files";

export const INCLUDE_DIR = "includes";

export interface UserSnippetsSummary {
  userSnippets: UserSnippet[];
}

export interface UserSnippet {
  replaceFrom: string;
  replaceTo: string;
}

/**
 * TODO: rename from `includes` to `snippets` in next major release.
 */
export function getSnippets(snippetFiles: ParsableFile[]): UserSnippet[] {
  return snippetFiles.map(getUserSnippetFromFile);
}

function getUserSnippetFromFile(parsableFile: ParsableFile): UserSnippet {
  const snippet = {
    replaceFrom: `<!-- %${parsableFile.filename}% -->`,
    replaceTo: parsableFile.rawText,
  };
  console.log(`[snippets] Loaded ${parsableFile.path}`);
  return snippet;
}
