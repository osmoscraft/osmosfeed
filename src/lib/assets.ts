import fs from "fs-extra";
import path from "path";
import { ENTRY_DIR } from "../utils/entry-dir";

export async function copyAssets() {
  await fs.copy(path.resolve(ENTRY_DIR, "assets"), path.resolve("public", "assets"));
  await fs.copy(path.resolve(ENTRY_DIR, "assets/favicon.ico"), path.resolve("public", "favicon.ico"));
  console.log(`[assets] Assets copied`);
}
