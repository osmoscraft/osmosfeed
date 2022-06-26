import { copyFile, mkdir, readdir } from "fs/promises";
import path from "path";

export async function copyFileDeep(src: string, dest: string) {
  const dir = path.dirname(dest);

  await mkdir(dir, { recursive: true });
  return copyFile(src, dest);
}

export async function readdirDeep(dir: string): Promise<string[]> {
  const absolutePaths = await readDirDeepHelper(dir);
  const relativePaths = absolutePaths.map((absPath) => path.relative(dir, absPath));

  return relativePaths;
}

async function readDirDeepHelper(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.join(dir, dirent.name);
      return dirent.isDirectory() ? await readDirDeepHelper(res) : res;
    })
  );
  return files.flat();
}
