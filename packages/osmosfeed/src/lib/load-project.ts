import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { ProjectConfig } from "../typings/config";
import { FileMetadata } from "./scan-dir";

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
export async function loadProject(files: FileMetadata[]): Promise<LoadedProject> {
  const configMeta = files.find((file) => ["osmosfeed.yml", "osmosfeed.yaml"].includes(file.filename));
  if (!configMeta) throw new Error("Config file not found");

  const configFileContent = yaml.load(await readFile(configMeta.path, "utf8")) as ProjectConfig;

  return {
    config: {
      metadata: configMeta,
      content: configFileContent,
    },
  };
}
