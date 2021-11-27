import { ProjectConfig } from "../typings/config";
import { FileMetadata, scanDir } from "./scan-dir";
import { readFile } from "fs/promises";

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
export async function loadProjectFiles(projectDir: string): Promise<ProjectFiles> {
  const dirSummary = await scanDir(projectDir);

  const configMeta = dirSummary.fileRecords.find((file) => ["osmosfeed.yml", "osmosfeed.yaml"].includes(file.filename));
  if (!configMeta) throw new Error("Config file not found");

  const configFileContent: ProjectConfig = JSON.parse(await readFile(configMeta.path, "utf8"));

  return {
    config: {
      metadata: configMeta,
      content: configFileContent,
    },
  };
}
