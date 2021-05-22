import { promises } from "fs";
import path from "path";

export const readFileAsync = promises.readFile;
export const readDirAsync = promises.readdir;

export async function readDirDeepAsync(dir: string): Promise<string[]> {
  const absolutePaths = await readDirDeepHelper(dir);
  const relativePaths = absolutePaths.map((absPath) => path.relative(dir, absPath));

  return relativePaths;
}

async function readDirDeepHelper(dir: string): Promise<string[]> {
  const dirents = await readDirAsync(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.join(dir, dirent.name);
      return dirent.isDirectory() ? await readDirDeepHelper(res) : res;
    })
  );
  return files.flat();
}
