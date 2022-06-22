import { readdir, readFile } from "fs/promises";
import yaml from "js-yaml";
import { join } from "path";
import { asError, extractError, undefinedAsError } from "../utils/error";
import { escapeUnicodeUrl } from "../utils/url";
import type { PipeFeed, ProjectConfig } from "./types";

export function useConfigInline(config: ProjectConfig): () => PipeFeed[] {
  return () =>
    config.feeds.map((feed) => {
      try {
        return {
          config: {
            url: escapeUnicodeUrl(feed.url),
          },
        };
      } catch (e) {
        return {
          config: asError(e),
        };
      }
    });
}

export function useConfigFile(): () => Promise<PipeFeed[]> {
  return async () => {
    const files = await readdir(process.cwd());
    const configFileName = files.find((file) => file === "osmosfeed.yaml" || file === "osmosfeed.yml");
    if (!configFileName) {
      throw new Error("Config file does not exist. Did you forget to add osmosfeed.yaml?");
    }

    const yamlString = await readFile(join(process.cwd(), configFileName), "utf-8");
    const configRawObj = yaml.load(yamlString) as ProjectConfig;

    const [_config, configError] = extractError(undefinedAsError(configRawObj?.feeds));
    if (configError) throw new Error("Invalid config format");

    return useConfigInline(configRawObj)();
  };
}
