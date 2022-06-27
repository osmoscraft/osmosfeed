import assert from "assert/strict";
import { readdir, readFile } from "fs/promises";
import yaml from "js-yaml";
import { join } from "path";
import type { ProjectTask } from "../engine/build";
import { getOffsetFromTimezoneName } from "../utils/time";
import { escapeUnicodeUrl } from "../utils/url";
import type { Project } from "./types";

export interface UserConfig {
  siteTitle?: string;
  timezone?: string;
  githubPageUrl?: string;
  outDir?: string;
  feeds: {
    url: string;
  }[];
}

export function configInline(config: UserConfig): ProjectTask<Project> {
  return () => {
    (config.feeds ?? []).every((feed) => assert(feed.url, "url is missing for one of the feeds"));

    return {
      outDir: config.outDir ?? "dist",
      feeds: config.feeds.map((feed) => ({
        version: "",
        title: "",
        feed_url: escapeUnicodeUrl(feed.url),
        items: [],
      })),
      githubServerUrl: process.env.GITHUB_SERVER_URL ?? null,
      githubRepository: process.env.GITHUB_REPOSITORY ?? null,
      githubRunId: process.env.GITHUB_RUN_ID ?? null,
      githubPageUrl: config.githubPageUrl ?? "http://localhost", // localhost is for testing only
      siteTitle: config.siteTitle ?? "osmos::feed",
      timezoneOffset: config.timezone ? getOffsetFromTimezoneName(config.timezone) : 0,
    };
  };
}

export function configFileYaml(baseConfig?: Partial<UserConfig>): ProjectTask<Project> {
  return async (project) => {
    const files = await readdir(process.cwd());
    const configFileName = files.find((file) => file === "osmosfeed.yaml" || file === "osmosfeed.yml");
    assert(configFileName, "Config file does not exist. Did you forget to add osmosfeed.yaml?");

    const yamlString = await readFile(join(process.cwd(), configFileName), "utf-8");
    const userConfig = yaml.load(yamlString) as UserConfig;

    const runConfigInline = configInline({ ...baseConfig, ...userConfig });
    return runConfigInline(project);
  };
}
