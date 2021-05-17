import fs from "fs-extra";
import path from "path";
import { ENTRY_DIR } from "../utils/entry-dir";
import type { TemplateSummary } from "./get-templates";

export const USER_STATIC_DIR = "static";
export const SYSTEM_STATIC_DIR = "system-static";
export const PUBLIC_ROOT_DIR = "public";

const FAVICON_FILENAME = "favicon.ico";

export async function copyStatic(templateSummary: TemplateSummary) {
  const isSystemTemplateIntact = templateSummary.partials.every((partials) => partials.source === "system");
  await copySystemStatic(isSystemTemplateIntact);

  // copy user asset last to allow overwrite
  await copyUserStatic();
}

export async function copySystemStatic(isSystemTemplateIntact: boolean) {
  const systemStaticDir = path.resolve(ENTRY_DIR, SYSTEM_STATIC_DIR);
  // To ensure assets compatibility, copy system static files only when all the templates are from the system.
  if (isSystemTemplateIntact) {
    await fs.copy(systemStaticDir, path.resolve(PUBLIC_ROOT_DIR));
    console.log(`[copy] System static files copied`);
  } else {
    await fs.copy(path.join(systemStaticDir, FAVICON_FILENAME), path.resolve(PUBLIC_ROOT_DIR, FAVICON_FILENAME));
    console.log(`[copy] User template present, only ${FAVICON_FILENAME} was copied`);
  }
}

export async function copyUserStatic() {
  const staticDir = path.resolve(USER_STATIC_DIR);

  try {
    await fs.copy(staticDir, path.resolve(PUBLIC_ROOT_DIR));
    console.log(`[copy] User static files copied`);
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log(`[copy] No user static files found`);
    } else {
      console.error(`[copy] Error copying ${staticDir}`, e);
    }
  }
}
