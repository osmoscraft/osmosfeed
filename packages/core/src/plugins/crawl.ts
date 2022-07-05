import assert from "assert";
import { load } from "cheerio";
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import path, { dirname } from "path";
import type { ItemTask, ProjectTask } from "../engine/build";
import { getSmartFetch } from "../utils/fetch";
import { resolveRelativeUrl, urlToFileString } from "../utils/url";
import type { ParseItemExt } from "./parse";
import type { JsonFeedItem, Project, TaskContext } from "./types";

export interface CrawlData {
  title?: string;
  description?: string;
  image?: string;
  icon?: string;
}

export function crawl(): ItemTask<JsonFeedItem, TaskContext> {
  return async (item, context) => {
    if (!item.url) return item;

    try {
      assert(context.project, "project is missing in context");

      const crawlOutputDir = path.join(process.cwd(), context.project.outDir, "crawl");

      const filename = `${urlToFileString(item.url)}.html`;
      const crawlOutputPath = path.join(crawlOutputDir, filename);

      const crawlHtml =
        (await tryReadFile(crawlOutputPath, async () => {
          console.log(`[crawl] EXISTS ${item.url}`);
        })) ??
        (await tryFetchFile(item.url, async (content) => {
          await mkdir(dirname(crawlOutputPath), { recursive: true });
          await writeFile(crawlOutputPath, content);
          console.log(`[crawl] FETCH ${item.url}`);
        }));

      const crawlData = await parseHtml(crawlHtml, item.url);

      return mergeCrawlData(item, crawlData);
    } catch (error) {
      console.error(`[crawl] ERR ${item.url}`, error);
      return item;
    }
  };
}

function mergeCrawlData(baseItem: JsonFeedItem & ParseItemExt, crawlData: CrawlData): JsonFeedItem & ParseItemExt {
  return {
    ...baseItem,
    summary:
      (baseItem.summary?.length ?? 0) > (crawlData.description?.length ?? 0) ? baseItem.summary : crawlData.description,
    image: baseItem.image ?? crawlData.image,
    _extIcon: baseItem._extIcon ?? crawlData.icon,
  };
}

async function tryReadFile(path: string, onRead?: (content: string) => any): Promise<string | null> {
  try {
    const content = await readFile(path, "utf-8");
    await onRead?.(content);
    return content;
  } catch (err) {
    if ((err as any)?.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

async function tryFetchFile(url: string, onFetched?: (content: string) => any): Promise<string> {
  const fetch = getSmartFetch();
  const response = await fetch(url);

  if (!response.ok) throw new Error(`Fetch failed with status ${response.status} ${response.statusText}`);
  const contentType = response.headers.get("Content-Type");
  if (!contentType?.startsWith("text/html")) throw new Error(`Cannot crawl non HTML content`);

  const content = trimHtml(await response.text());

  await onFetched?.(content);

  return content;
}

export function pruneCrawlData(): ProjectTask<Project> {
  return async (project) => {
    const crawlOutputDir = path.join(process.cwd(), project.outDir, "crawl");

    const usedFilePaths = project.feeds
      .map((feed) => feed.items.map((item) => item.url))
      .flat()
      .filter((url) => url)
      .map((url) => `${urlToFileString(url!)}.html`) as string[];

    const allFilePaths = await readdir(crawlOutputDir);

    const deletePaths = allFilePaths.filter((filePath) => !usedFilePaths.includes(filePath));

    await Promise.all(deletePaths.map((deletePath) => rm(path.join(crawlOutputDir, deletePath))));
    console.log(`[crawl] removed ${deletePaths.length} unused html files`);

    return project;
  };
}

function trimHtml(htmlString: string): string {
  const $ = load(htmlString);
  $("script,style,iframe").remove();
  return $.html();
}

async function parseHtml(htmlString: string, pageUrl: string): Promise<CrawlData> {
  const $ = load(htmlString);

  const maybeImageUrl = $(`head > meta[property="og:image"]`).attr("content");
  const absoluteImageUrl = maybeImageUrl ? resolveRelativeUrl(maybeImageUrl, pageUrl) ?? undefined : undefined;
  const corsProxyIconUrl = pageUrl ? `https://icons.duckduckgo.com/ip2/${new URL(pageUrl).hostname}.ico` : undefined;

  return {
    title: $(`head > meta[property="og:title"]`).attr("content"),
    description: $(`head > meta[property="og:description"]`).attr("content"),
    image: absoluteImageUrl,
    icon: corsProxyIconUrl,
  };
}
