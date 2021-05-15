import fs from "fs-extra";
import path from "path";

export const INCLUDE_DIR = "includes";
export const SYSTEM_TEMPLATE_DIR = "src/system-templates";

export interface UserTemplateSummary {
  partials: Partial[];
}

export interface Partial {
  name: string;
  template: string;
}

/**
 * Detect and load any custom HTML snippet from the `includes` dir.
 * TODO: rename from `includes` to `snippets` in next major release.
 */
export async function getTemplates(): Promise<UserTemplateSummary> {
  // TODO load built-in template by default.
  // Then allow override from user include dir.
  // const includeDir = path.resolve(INCLUDE_DIR);
  const includeDir = path.resolve(SYSTEM_TEMPLATE_DIR);
  const includeFilenames = await fs.readdir(includeDir).catch(() => [] as string[]);

  const includeFileDetails = includeFilenames.map((filename) => ({
    path: path.join(includeDir, filename),
    ext: path.extname(filename).toLowerCase(),
    basename: filename,
  }));

  const htmlIncludes = includeFileDetails.filter((detail) => [".hbs"].includes(detail.ext));
  console.log(`[template] Found ${htmlIncludes.length} templates`);

  const fsSnippets = await Promise.all(
    htmlIncludes.map((htmlInclude) =>
      fs
        .readFile(htmlInclude.path, "utf-8")
        .then((content) => {
          console.log(`[template] Loaded ${htmlInclude.path}`);
          return {
            name: htmlInclude.basename.replace(".hbs", ""),
            template: content,
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
