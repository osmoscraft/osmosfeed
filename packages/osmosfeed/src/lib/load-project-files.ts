import { ProjectConfig } from "../typings/config";
import { FileMetadata } from "./scan-dir";

export interface ProjectFiles {
  config: VirtualFile<ProjectConfig>;
}

export interface VirtualFile<T = string> {
  metadata: FileMetadata;
  content: T;
}

/**
 * Read all project related files into the memory
 */
export async function loadProjectFiles(projectDir: string) {}
