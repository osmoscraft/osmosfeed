import { readdir, readFile } from "fs/promises";
import path, { basename, extname, resolve } from "path";

export interface FileHandle {
  relativePath: string;
  read: () => {
    fullPath: string;
    name: string;
    ext: string;
    text(): Promise<string>;
  };
}
export async function getFileHandles(baseDir: string): Promise<FileHandle[]> {
  const filePaths = await getFilesRecursive(baseDir);

  const readHandle = (fullPath: string) => ({
    fullPath,
    name: basename(fullPath),
    ext: extname(fullPath),
    text: async () => readFile(fullPath, "utf-8"),
    json: async () => JSON.parse(await readFile(fullPath, "utf-8")),
  });

  return filePaths.map((fullPath) => ({
    relativePath: path.relative(baseDir, fullPath),
    read: () => readHandle(fullPath),
  }));
}

// credit: https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
async function getFilesRecursive(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFilesRecursive(res) : res;
    })
  );
  return files.flat();
}
