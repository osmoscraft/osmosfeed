import { readFile } from "fs/promises";
import { FileMetadata, VirtualFile } from "./virtual-file";

export async function loadTextFile(metadata: FileMetadata): Promise<VirtualFile> {
  const content = await readFile(metadata.path, "utf-8");

  return {
    metadata: metadata,
    content,
  };
}

export async function loadBinaryFile(metadata: FileMetadata): Promise<VirtualFile<Buffer>> {
  const content = await readFile(metadata.path);

  return {
    metadata: metadata,
    content,
  };
}
