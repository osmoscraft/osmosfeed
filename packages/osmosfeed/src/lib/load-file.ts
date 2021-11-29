import { readFile } from "fs/promises";
import { FileMetadata, VirtualFile } from "./virtual-file";

export async function loadTextFile(metadata: FileMetadata): Promise<VirtualFile> {
  const content = await readFile(metadata.path, "utf-8");

  return {
    metadata,
    content,
  };
}

export async function loadBinaryFile(metadata: FileMetadata): Promise<VirtualFile<Buffer>> {
  const content = await readFile(metadata.path);

  return {
    metadata,
    content,
  };
}

export async function loadJsonFile<T = any>(metadata: FileMetadata): Promise<VirtualFile<T>> {
  const content = require(metadata.path);

  return {
    metadata,
    content,
  };
}
