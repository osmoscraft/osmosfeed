import { readDirRecursive } from "./fs-utils";
import path from "path";
import { FileMetadata } from "./virtual-file";
import { mimeMap } from "./mime-map";

export interface DirectorySummary {
  root: string;
  files: FileMetadata[];
}

/**
 * @return A flat array of file metadata, recursively collected from the given root
 */
export async function scanDir(dir: string): Promise<DirectorySummary> {
  const files = await readDirRecursive(dir);
  const fileRecords = files.map((file) => ({
    path: path.join(dir, file),
    filename: path.basename(file),
    extension: path.extname(file),
    mime: mimeMap.get(path.extname(file)),
  }));

  return {
    root: dir,
    files: fileRecords,
  };
}
