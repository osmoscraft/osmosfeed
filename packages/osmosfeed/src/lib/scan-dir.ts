import { readDirRecursive } from "./fs-utils";
import path from "path";

export interface DirectorySummary {
  fileRecords: FileMetadata[];
}

export interface FileMetadata<T = any> {
  path: string;
  filename: string;
  extension: string;
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
  }));

  return {
    fileRecords,
  };
}
