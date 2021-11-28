import { VirtualFile } from "./virtual-file";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export interface FileWrite {
  fromMemory: string | Buffer;
  toPath: string;
}

export async function writeProject(fileWrites: FileWrite[]) {
  // TODO ensure all directory exists
  const allDirs = fileWrites.map((file) => path.dirname(file.toPath));
  const uniqueDirs = [...new Set(allDirs)];

  // TODO to improve perf, only write leaf directories
  await Promise.all(uniqueDirs.map((dir) => mkdir(dir, { recursive: true })));

  await Promise.all(fileWrites.map((fileWrite) => writeFile(fileWrite.toPath, fileWrite.fromMemory)));
}
