import yaml from "js-yaml";
import path from "path";
import { readFileAsync } from "../utils/fs";

export interface Source {
  href: string;
}

export interface Config {
  sources: Source[];
  cacheUrl: string | null;
  cacheMaxDays: number;
  siteTitle: string;
}

const CONFIG_FILENAME = "osmosfeed.yaml";

export async function getConfig(): Promise<Config> {
  return { ...getDefaultConfig(), ...(await getUserConfig()) };
}

function getDefaultConfig(): Config {
  return {
    sources: [],
    cacheUrl: null,
    cacheMaxDays: 30,
    siteTitle: "osmos::feed",
  };
}

/**
 * Return empty object when user config doesn't exist
 */
async function getUserConfig(): Promise<Config | {}> {
  const configPath = path.resolve(CONFIG_FILENAME);

  try {
    const sourcesText = await readFileAsync(configPath, { encoding: "utf8" });
    const userConfig = yaml.load(sourcesText) as Partial<Config>; // TODO error checking
    console.log(`[config] Config loaded ${configPath}`);
    return userConfig;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`[config] No config found at ${configPath}`);
      return {};
    } else {
      throw error;
    }
  }
}
