import type { ParsableFile } from "./discover-files";
import yaml from "js-yaml";

export interface Source {
  href: string;
}

export interface Config {
  sources: Source[];
  cacheUrl: string | null;
  cacheMaxDays: number;
  siteTitle: string;
}

export async function getConfig(configFile: ParsableFile | null): Promise<Config> {
  const userConfig = configFile ? parseUserConfig(configFile.rawText) : {};
  const effectiveConfig = { ...getDefaultConfig(), ...userConfig };
  console.log(`[load-config] Effective config: `, effectiveConfig);
  return effectiveConfig;
}

function getDefaultConfig(): Config {
  return {
    sources: [],
    cacheUrl: null,
    cacheMaxDays: 30,
    siteTitle: "osmos::feed",
  };
}

function parseUserConfig(configRawText: string) {
  return yaml.load(configRawText) as Partial<Config>;
}
