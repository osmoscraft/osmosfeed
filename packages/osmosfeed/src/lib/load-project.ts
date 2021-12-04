import yaml from "js-yaml";
import { ProjectConfig } from "@osmoscraft/osmosfeed-types";
import { loadJsonFile, loadTextFile } from "./load-file";
import { UrlMapJson } from "./url-map";
import { FileMetadata } from "./virtual-file";

export interface LoadedProject {
  config: ProjectConfig;
  urlMapJson: UrlMapJson;
}

/**
 * Read all project related files into the memory
 */
export async function loadProject(files: FileMetadata[]): Promise<LoadedProject> {
  const configMeta = files.find((file) => ["osmosfeed.yml", "osmosfeed.yaml"].includes(file.filename));
  if (!configMeta) throw new Error("Config file not found");

  const configFileContent = yaml.load((await loadTextFile(configMeta)).content) as ProjectConfig;

  const urlMapPath = files.find((file) => file.filename === "url-map.json");
  const urlMapJson = urlMapPath ? (await loadJsonFile<UrlMapJson>(urlMapPath)).content : getEmptyUrlMap();

  return {
    config: configFileContent,
    urlMapJson: urlMapJson,
  };
}

function getEmptyUrlMap(): UrlMapJson {
  return [];
}
