import fs from "fs-extra";
import path from "path";
import { ENTRY_DIR } from "../utils/entry-dir";

export const USER_STATIC_DIR = "static";
export const SYSTEM_STATIC_DIR = "system-static";
export const PUBLIC_ROOT_DIR = "public";

export async function copyStatic() {
  await copySystemStatic();
  // copy user asset last to allow overwrite
  await copyUserStatic();
}

export async function copySystemStatic() {
  await fs.copy(path.resolve(ENTRY_DIR, SYSTEM_STATIC_DIR), path.resolve(PUBLIC_ROOT_DIR));
  console.log(`[copy] System static files copied`);
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
