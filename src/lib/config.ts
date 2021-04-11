import yaml from "js-yaml";
import fs from "fs";
import path from "path";

export interface Source {
  href: string;
}

export interface Config {
  sources: Source[];
  cacheUrl: string | null;
}

const CONFIG_FILENAME = "osmosfeed.yaml";

export function getConfig() {
  // populate config with default values
  const defaultConfig: Config = {
    sources: [],
    cacheUrl: null,
  };

  const sourcesText = fs.readFileSync(path.resolve(CONFIG_FILENAME), "utf8");
  const customizedConfig = yaml.load(sourcesText) as Partial<Config>; // TODO error checking

  const config = { ...defaultConfig, ...customizedConfig };
  return config;
}
