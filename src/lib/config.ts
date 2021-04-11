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

const EMPTY_CONFIG: Config = {
  sources: [],
  cacheUrl: null,
};

export function getConfig(): Config {
  // populate config with default values
  const defaultConfig: Config = {
    sources: [],
    cacheUrl: null,
  };

  const configPath = path.resolve(CONFIG_FILENAME);

  try {
    const sourcesText = fs.readFileSync(configPath, "utf8");
    const customizedConfig = yaml.load(sourcesText) as Partial<Config>; // TODO error checking

    const config = { ...defaultConfig, ...customizedConfig };
    console.log(`[config] Config loaded ${configPath}`);
    return config;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`[config] No config found at ${configPath}`);
      return EMPTY_CONFIG;
    } else {
      throw error;
    }
  }
}
