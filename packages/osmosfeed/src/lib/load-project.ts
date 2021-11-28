import yaml from "js-yaml";
import { ProjectConfig } from "../typings/config";
import { loadTextFile } from "./load-file";
import { FileMetadata, VirtualFile } from "./virtual-file";

export interface LoadedProject {
  config: VirtualFile<ProjectConfig>;
}

/**
 * Read all project related files into the memory
 */
export async function loadProject(files: FileMetadata[]): Promise<LoadedProject> {
  const configMeta = files.find((file) => ["osmosfeed.yml", "osmosfeed.yaml"].includes(file.filename));
  if (!configMeta) throw new Error("Config file not found");

  const configFileContent = yaml.load((await loadTextFile(configMeta)).content) as ProjectConfig;

  return {
    config: {
      metadata: configMeta,
      content: configFileContent,
    },
  };
}
