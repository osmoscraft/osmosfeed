import { promises } from "fs";
import path from "path";

export const readFileAsync = promises.readFile;
export const readDirAsync = promises.readdir;
export const mkdirAsync = promises.mkdir;
export const writeFileAsync = promises.writeFile;
export const copyFileAsync = promises.copyFile;

export async function copyFileDeepAsync(src: string, dest: string) {
  const dir = path.dirname(dest);

  await mkdirAsync(dir, { recursive: true });
  return copyFileAsync(src, dest);
}

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
