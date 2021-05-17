import fs from "fs-extra";
import path from "path";
import { ENTRY_DIR } from "../utils/entry-dir";

export const INCLUDE_DIR = "includes";
export const SYSTEM_TEMPLATE_DIR = "system-templates";

export interface TemplateSummary {
  partials: Partial[];
}

export interface Partial {
  name: string;
  template: string;
  source: PartialSource;
}

export type PartialSource = "user" | "system";

interface FileSummary {
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
  const systemIncludeFilenames = await fs.readdir(systemIncludeDir).catch(() => [] as string[]);

  const userIncludeDir = path.resolve(INCLUDE_DIR);
  const userIncludeFilenames = await fs.readdir(userIncludeDir).catch(() => [] as string[]);

  const userIncludeFileMapper = getFileSummaryMapper(userIncludeDir, "user");
  const systemIncludeFileMapper = getFileSummaryMapper(systemIncludeDir, "system");

  const includeFileDetails = [
    ...userIncludeFilenames.map(userIncludeFileMapper),
    ...systemIncludeFilenames.map(systemIncludeFileMapper),
  ].reduce<FileSummary[]>((fileSummaries, currentFileSummary) => {
    if (!fileSummaries.some((file) => file.filename === currentFileSummary.filename)) {
      fileSummaries.push(currentFileSummary);
    }

    return fileSummaries;
  }, []);

  const htmlIncludes = includeFileDetails.filter((detail) => [".hbs"].includes(detail.ext));

  const fsSnippets = await Promise.all(
    htmlIncludes.map((htmlInclude) =>
      fs
        .readFile(htmlInclude.path, "utf-8")
        .then((content) => {
          console.log(`[template] Loaded ${htmlInclude.source} template: ${htmlInclude.path}`);
          return {
            name: htmlInclude.filename.replace(".hbs", ""),
            template: content,
            source: htmlInclude.source,
          };
        })
        .catch((e) => {
          console.error(`[template] error loading ${htmlInclude.path}`);
          return null;
        })
    )
  );

  const includedPartials = fsSnippets.filter((partial): partial is Partial => partial !== null);

  return {
    partials: includedPartials,
  };
}

function getFileSummaryMapper(dir: string, source: PartialSource) {
  return (filename: string) => ({
    path: path.join(dir, filename),
    ext: path.extname(filename).toLowerCase(),
    filename: filename,
    source,
  });
}
