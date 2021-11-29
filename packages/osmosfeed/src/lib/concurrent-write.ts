import { VirtualFile } from "./virtual-file";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export interface WriteRequest {
  fromMemory: string | Buffer;
  toPath: string;
}

export async function concurrentWrite(writeRequests: WriteRequest[]) {
  const allDirs = writeRequests.map((file) => path.dirname(file.toPath));
  const uniqueDirs = [...new Set(allDirs)];

  // TODO to improve perf, only write leaf directories
  await Promise.all(uniqueDirs.map((dir) => mkdir(dir, { recursive: true })));

  await Promise.all(writeRequests.map((fileWrite) => writeFile(fileWrite.toPath, fileWrite.fromMemory)));
}
