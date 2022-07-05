import assert from "assert";
import { load } from "cheerio";
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import path, { dirname } from "path";
import type { ItemTask, ProjectTask } from "../engine/build";
import { getSmartFetch } from "../utils/fetch";
import { resolveRelativeUrl, urlToFileString } from "../utils/url";
import type { JsonFeedItem, Project, TaskContext } from "./types";

export interface CrawlItemExt {
  _extCrawl?: CrawlData;
}

export interface CrawlData {
  iconBase64?: string;
  title?: string;
  description?: string;
  image?: string;
}

export function crawl(): ItemTask<JsonFeedItem & CrawlItemExt, TaskContext> {
  return async (item, context) => {
    if (!item.url) return item;

    try {
      assert(context.project, "project is missing in context");

      const crawlOutputDir = path.join(process.cwd(), context.project.outDir, "crawl");

      const filename = `${urlToFileString(item.url)}.html`;
      const crawlOutputPath = path.join(crawlOutputDir, filename);

      try {
        const crawlHtml = await readFile(crawlOutputPath, "utf-8");
        const crawlData = await parseHtml(crawlHtml, item.url);
        console.log(`[crawl] EXIST ${item.url}`);

        return {
          ...item,
          _extCrawl: crawlData,
        };
      } catch {
        const fetch = getSmartFetch();
        const response = await fetch(item.url);

        if (!response.ok) throw new Error(`Fetch failed with status ${response.status} ${response.statusText}`);
        const contentType = response.headers.get("Content-Type");
        if (!contentType?.startsWith("text/html")) throw new Error(`Cannot crawl non HTML content`);

        const crawlHtml = await response.text();
        const crawlData = await parseHtml(crawlHtml, item.url);

        await mkdir(dirname(crawlOutputPath), { recursive: true });
        await writeFile(crawlOutputPath, crawlHtml);

        console.log(`[crawl] OK ${item.url}`);

        return {
          ...item,
          _extCrawl: crawlData,
        };
      }
    } catch (error) {
      console.error(`[crawl] ERR ${item.url}`, error);
      return item;
    }
  };
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

async function parseHtml(htmlString: string, pageUrl: string): Promise<CrawlData> {
  const $ = load(htmlString);

  const maybeImageUrl = $(`head > meta[property="og:image"]`).attr("content");
  const absoluteImageUrl = maybeImageUrl ? resolveRelativeUrl(maybeImageUrl, pageUrl) ?? undefined : undefined;
  return {
    title: $(`head > meta[property="og:title"]`).attr("content"),
    description: $(`head > meta[property="og:description"]`).attr("content"),
    image: absoluteImageUrl,
  };
}
