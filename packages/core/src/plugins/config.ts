import assert from "assert";
import { readdir, readFile } from "fs/promises";
import yaml from "js-yaml";
import { join } from "path";
import type { ProjectTask } from "../runtime";
import { escapeUnicodeUrl } from "../utils/url";
import type { Project } from "./types";

export interface UserConfig {
  feeds: {
    url: string;
  }[];
}

export function configInline(config: UserConfig): ProjectTask<Project> {
  return () => {
    (config.feeds ?? []).every((feed) => assert(feed.url, "url is missing for one of the feeds"));

    return {
      feeds: config.feeds.map((feed) => ({
        version: "",
        title: "",
        feed_url: escapeUnicodeUrl(feed.url),
        items: [],
      })),
    };
  };
}

export function configFileYaml(): ProjectTask<Project> {
  return async (project) => {
    const files = await readdir(process.cwd());
    const configFileName = files.find((file) => file === "osmosfeed.yaml" || file === "osmosfeed.yml");
    assert(configFileName, "Config file does not exist. Did you forget to add osmosfeed.yaml?");

    const yamlString = await readFile(join(process.cwd(), configFileName), "utf-8");
    const userConfig = yaml.load(yamlString) as UserConfig;

    const runConfigInline = configInline(userConfig);
    return runConfigInline(project);
  };
}
