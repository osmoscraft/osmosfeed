import fs from "fs-extra";
import path from "path";

export async function copyAssets() {
  await fs.copy(path.resolve("src/assets"), path.resolve("dist/assets"));
  console.log(`[assets] assets copied`);
}
