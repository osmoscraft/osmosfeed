import assert from "assert/strict";
import { readdir, readFile } from "fs/promises";
import yaml from "js-yaml";
import { join } from "path";
import type { ProjectTask } from "../engine/build";
import { pkg } from "../utils/pkg";
import { getOffsetFromTimezoneName } from "../utils/time";
import { escapeUnicodeUrl } from "../utils/url";
import type { Project, TaskContext } from "./types";

export interface UserConfig {
  siteTitle?: string;
  timezone?: string;
  githubPageUrl?: string;
  outDir?: string;
  feeds: {
    url: string;
  }[];
}

export interface ConfigFeedExt {
  _extGeneratorVersion: string;
}

export function configInline(config: UserConfig): ProjectTask<Project, TaskContext> {
  return async (_project, context) => {
    (config.feeds ?? []).every((feed) => assert(feed.url, "url is missing for one of the feeds"));

    const project: Project & ConfigFeedExt = {
      _extGeneratorVersion: pkg.version,
      outDir: config.outDir ?? "./",
      feeds: config.feeds.map((feed) => ({
        version: "",
        title: "",
        feed_url: escapeUnicodeUrl(feed.url),
        items: [],
      })),
      githubServerUrl: process.env.GITHUB_SERVER_URL ?? null,
      githubRepository: process.env.GITHUB_REPOSITORY ?? null,
      githubRunId: process.env.GITHUB_RUN_ID ?? null,
      githubPageUrl: config.githubPageUrl ?? (await getGithubPageUrl()),
      siteTitle: config.siteTitle ?? "osmos::feed",
      timezoneOffset: config.timezone ? getOffsetFromTimezoneName(config.timezone) : 0,
    };

    Object.assign(context, { project });

    return project;
  };
}

export function configFileYaml(baseConfig?: Partial<UserConfig>): ProjectTask<Project, TaskContext> {
  return async (project, context) => {
    const files = await readdir(process.cwd());
    const configFileName = files.find((file) => file === "osmosfeed.yaml" || file === "osmosfeed.yml");
    assert(configFileName, "Config file does not exist. Did you forget to add osmosfeed.yaml?");

    const yamlString = await readFile(join(process.cwd(), configFileName), "utf-8");
    const userConfig = yaml.load(yamlString) as UserConfig;

    const runConfigInline = configInline({ ...baseConfig, ...userConfig });
    return runConfigInline(project, context);
  };
}

async function getGithubPageUrl(): Promise<string> {
  const fallbackUrl = "http://localhost";
  try {
    const repoOwner = process.env.GITHUB_REPOSITORY_OWNER;
    const repoName = process.env.GITHUB_REPOSITORY;
    const token = process.env.GITHUB_TOKEN;

    if (!repoOwner || !repoName) {
      console.log(`[config] github workflow environment not found, fallback to local environment`);
      return fallbackUrl;
    }
    if (!token) {
      console.error(
        `[config] github token is missing the workflow environment, did you forget to expose it in workflow config?`
      );
      return fallbackUrl;
    }

    const pagesResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pages`, {
      headers: {
        Accept: "application/vnd/github.v3+json",
        Authorization: `token ${token}`,
      },
    });

    if (!pagesResponse.ok)
      throw new Error(`github rest api call failed, status ${pagesResponse.status} ${pagesResponse.statusText}`);

    const pagesData = await pagesResponse.json();
    // ref: https://docs.github.com/en/rest/pages#get-a-github-pages-site
    const githubPageUrl = pagesData.html_url;

    assert(githubPageUrl, "html_url does not exist on github API response");

    console.log(`[config] github page url: ${getGithubPageUrl}`);
    return githubPageUrl;
  } catch (e) {
    console.error(`[config] something went wrong while fetching github page url`, e);
    return fallbackUrl;
  }
}
