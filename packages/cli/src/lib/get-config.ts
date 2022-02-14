import yaml from "js-yaml";
import type { ParsableFile } from "./discover-files";
import { normalizeUrl } from "./normalize-url";
import { getOffsetFromTimezoneName } from "./time";

export interface Source {
  href: string;
}

export interface Config {
  sources: Source[];
  cacheUrl: string | null;
  cacheMaxDays: number;
  siteTitle: string;
  timezone: string | null;
  timezoneOffset: number;
  githubServerUrl: string | null;
  githubRepository: string | null;
  githubRunId: string | null;
}

export async function getConfig(configFile: ParsableFile | null): Promise<Config> {
  const userConfig = configFile ? parseUserConfig(configFile.rawText) : {};
  const mergedConfig: Config = { ...getDefaultConfig(), ...userConfig };
  const effectiveConfig: Config = {
    ...mergedConfig,
    sources: mergedConfig.sources.map((source) => ({
      ...source,
      href: normalizeUrl(source.href),
    })),
    timezoneOffset: mergedConfig.timezone ? getOffsetFromTimezoneName(mergedConfig.timezone) : 0,
  };
  console.log(`[load-config] Effective config: `, effectiveConfig);
  return effectiveConfig;
}

function getDefaultConfig(): Config {
  return {
    sources: [],
    cacheUrl: null,
    cacheMaxDays: 30,
    siteTitle: "osmos::feed",
    timezone: null,
    timezoneOffset: 0,
    githubServerUrl: process.env.GITHUB_SERVER_URL ?? null,
    githubRepository: process.env.GITHUB_REPOSITORY ?? null,
    githubRunId: process.env.GITHUB_RUN_ID ?? null,
  };
}

function parseUserConfig(configRawText: string) {
  return yaml.load(configRawText) as Partial<Config>;
}
