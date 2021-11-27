import { readdir, mkdir, copyFile } from "fs/promises";
import path from "path";

export async function copyFilesRecursive(src: string, dest: string) {
  const dir = path.dirname(dest);

  await mkdir(dir, { recursive: true });
  return copyFile(src, dest);
}

export async function readDirRecursive(dir: string): Promise<string[]> {
  const absolutePaths = await readDirHelper(dir);
  const relativePaths = absolutePaths.map((absPath) => path.relative(dir, absPath));

  return relativePaths;
}

async function readDirHelper(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.join(dir, dirent.name);
      return dirent.isDirectory() ? await readDirHelper(res) : res;
    })
  );
  return files.flat();
}
