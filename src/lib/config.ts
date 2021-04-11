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

const DEMO_CONFIG: Config = {
  sources: [
    { href: "https://css-tricks.com/feed/" },
    { href: "https://tympanus.net/codrops/feed/" },
    { href: "https://www.smashingmagazine.com/feed/" },
  ],
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
      console.log(`[config] No config found at ${configPath}. Using demo config.`);
      return DEMO_CONFIG;
    } else {
      throw error;
    }
  }
}
