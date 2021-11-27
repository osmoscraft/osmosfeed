import { ProjectConfig } from "../typings/config";
import { FileMetadata, scanDir } from "./scan-dir";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

export interface LoadedProject {
  config: VirtualFile<ProjectConfig>;
}

export interface VirtualFile<T = string> {
  metadata: FileMetadata;
  content: T;
}

/**
 * Read all project related files into the memory
 */
export async function loadProject(projectDir: string): Promise<LoadedProject> {
  const dirSummary = await scanDir(projectDir);

  const configMeta = dirSummary.fileRecords.find((file) => ["osmosfeed.yml", "osmosfeed.yaml"].includes(file.filename));
  if (!configMeta) throw new Error("Config file not found");

  const configFileContent = yaml.load(await readFile(configMeta.path, "utf8")) as ProjectConfig;

  return {
    config: {
      metadata: configMeta,
      content: configFileContent,
    },
  };
}
