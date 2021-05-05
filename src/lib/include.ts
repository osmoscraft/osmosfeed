import fs from "fs-extra";
import path from "path";

export const INCLUDE_DIR = "includes";

export interface IncludeSummary {
  includeSnippets: IncludeSnippet[];
}

export interface IncludeSnippet {
  replaceFrom: string;
  replaceTo: string;
}

/**
 * Detect and load any custom HTML snippet from the `includes` dir.
 */
export async function include(): Promise<IncludeSummary> {
  const includeDir = path.resolve(INCLUDE_DIR);
  const includeFilenames = await fs.readdir(includeDir).catch(() => [] as string[]);

  const includeFileDetails = includeFilenames.map((filename) => ({
    path: path.join(includeDir, filename),
    ext: path.extname(filename).toLowerCase(),
    basename: filename,
  }));

  const htmlIncludes = includeFileDetails.filter((detail) => [".html", ".htm"].includes(detail.ext));
  console.log(`[include] Found ${htmlIncludes.length} html files`);

  const fsSnippets = await Promise.all(
    htmlIncludes.map((htmlInclude) =>
      fs
        .readFile(htmlInclude.path, "utf-8")
        .then((content) => {
          console.log(`[include] Loaded ${htmlInclude.path}`);
          return {
            replaceFrom: `<!-- %${htmlInclude.basename}% -->`,
            replaceTo: content,
          };
        })
        .catch((e) => {
          console.error(`[include] error loading ${htmlInclude.path}`);
          return null;
        })
    )
  );

  const includeSnippets = fsSnippets.filter((snippet): snippet is IncludeSnippet => snippet !== null);

  return {
    includeSnippets,
  };
}
