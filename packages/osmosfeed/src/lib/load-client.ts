import path from "path";
import { loadBinaryFile } from "./load-file";
import { FileMetadata, VirtualFile } from "./virtual-file";

export interface LoadedClient {
  root: string;
  files: RelativeVirtualFile<Buffer>[];
}

export interface RelativeVirtualFile<T> extends VirtualFile<T> {
  relativePath: string;
}

/**
 * Read all client files into the memory
 */
export async function loadClient(files: FileMetadata[], root: string): Promise<LoadedClient> {
  const loadedFiles = await Promise.all(
    files.map(async (file) => ({
      ...(await loadBinaryFile(file)),
      relativePath: path.relative(root, file.path),
    }))
  );
  return {
    root,
    files: loadedFiles,
  };
}
