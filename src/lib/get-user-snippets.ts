import fs from "fs-extra";
import path from "path";

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
  const includeFilenames = await fs.readdir(includeDir).catch(() => [] as string[]);

  const includeFileDetails = includeFilenames.map((filename) => ({
    path: path.join(includeDir, filename),
    ext: path.extname(filename).toLowerCase(),
    basename: filename,
  }));

  const htmlIncludes = includeFileDetails.filter((detail) => [".html", ".htm"].includes(detail.ext));
  console.log(`[snippets] Found ${htmlIncludes.length} user html snippets`);

  const fsSnippets = await Promise.all(
    htmlIncludes.map((htmlInclude) =>
      fs
        .readFile(htmlInclude.path, "utf-8")
        .then((content) => {
          console.log(`[snippets] Loaded ${htmlInclude.path}`);
          return {
            replaceFrom: `<!-- %${htmlInclude.basename}% -->`,
            replaceTo: content,
          };
        })
        .catch((e) => {
          console.error(`[snippets] error loading ${htmlInclude.path}`);
          return null;
        })
    )
  );

  const includeSnippets = fsSnippets.filter((snippet): snippet is UserSnippet => snippet !== null);

  return {
    userSnippets: includeSnippets,
  };
}
