import cheerio from "cheerio";
import { performance } from "perf_hooks";
import Parser from "rss-parser";
import { downloadTextFile } from "../utils/download";
import { htmlToText } from "../utils/html-to-text";
import type { Cache } from "./get-cache";
import type { Config, Source } from "./get-config";

const MILLISECONDS_PER_DAY = 86400000; // 1000 * 60 * 60 * 24
const SUMMARY_TRIM_ACTIVATION_THRESHOLD = 2048; // characters
const SUMMARY_TRIM_TO_LENGTH = 1024; // characters

export interface EnrichedArticle {
  id: string;
  author: string | null;
  description: string;
  link: string;
  publishedOn: string;
  title: string;
  wordCount: number | null;
}

export interface EnrichedSource {
  title: string | null;
  feedUrl: string;
  siteUrl: string | null;
  articles: EnrichedArticle[];
}

const parser = new Parser();

export interface EnrichInput {
  source: Source;
  cache: Cache;
  config: Config;
}

export async function enrich(enrichInput: EnrichInput): Promise<EnrichedSource> {
  // TODO split into download, parse, report, etc. steps
  return enrichInternal(enrichInput);
}

async function enrichInternal(enrichInput: EnrichInput): Promise<EnrichedSource> {
  const { source, cache, config } = enrichInput;

  const startTime = performance.now();
  const xmlString = await downloadTextFile(source.href);
  const rawFeed = await parser.parseString(xmlString)!.catch((err) => {
    console.error(`[enrich] Parse source failed ${source.href}`);
    throw err;
  });
  const feed = normalizeFeed(rawFeed);
  const items = feed.items;
  const now = Date.now();

  const cachedArticles = cache.sources.find((cachedSource) => cachedSource.feedUrl === source.href)?.articles ?? [];

  const newItems = items.filter((item) => cachedArticles.every((article) => article.link !== item.link));

  const newArticlesAsync: Promise<EnrichedArticle | null>[] = newItems.map(async (item) => {
    const title = item.title ?? "Untitled";
    const link = item.link;

    if (!link) return null;

    // TODO split into download, parse steps
    const enrichedItem = await enrichItem(link);
    const description = item.contentSnippet ?? enrichedItem.description ?? "";
    const publishedOn = item.isoDate ?? enrichedItem.publishedTime?.toISOString() ?? new Date().toISOString();
    const id = item.guid ?? link;
    const author = item.creator ?? null;

    const enrichedArticle: EnrichedArticle = {
      id,
      author,
      description,
      link,
      publishedOn,
      wordCount: enrichedItem.wordCount,
      title,
    };

    return enrichedArticle;
  });

  const newArticles = (await Promise.all(newArticlesAsync)).filter((article) => article !== null) as EnrichedArticle[];

  const combinedArticles = [...newArticles, ...cachedArticles];
  const renderedArticles = combinedArticles
    .filter(
      (item) => Math.round((now - new Date(item.publishedOn).getTime()) / MILLISECONDS_PER_DAY) < config.cacheMaxDays
    )
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);

  console.log(
    `[enrich] ${durationInSeconds.toString().padStart(4)}s | ${cachedArticles.length
      .toString()
      .padStart(3)} cached | ${(renderedArticles.length - cachedArticles.length).toString().padStart(3)} new | ${
      source.href
    }`
  );

  return {
    title: feed.title ?? null,
    feedUrl: source.href,
    siteUrl: feed.link ?? null,
    articles: renderedArticles,
  };
}

export interface EnrichItemResult {
  description: string | null;
  wordCount: number | null;
  publishedTime: Date | null;
}

async function enrichItem(link: string): Promise<EnrichItemResult> {
  try {
    const responseHtml = await downloadTextFile(link);

    const $ = cheerio.load(responseHtml);
    const plainText = $.root().text();

    const wordCount = plainText.split(/\s+/).length;

    let description = $(`meta[property="og:description"]`).attr("content") ?? null;
    if (!description?.length) {
      description = $(`meta[name="twitter:description"]`).attr("content") ?? null;
    }
    if (!description?.length) {
      description = $(`meta[name="description"]`).attr("content") ?? null;
    }
    description = description?.length ? htmlToText(description) : null;

    let publishedTime: Date | null = null;
    const publishedTimeString = $(`meta[property="article:published_time"]`).attr("content") ?? null;
    if (publishedTimeString) {
      try {
        publishedTime = new Date(publishedTimeString);
      } catch (error) {
        console.log(`[enrish] Parse time error ${link}`);
      }
    }

    const enrichItemResult: EnrichItemResult = {
      description,
      wordCount,
      publishedTime,
    };

    return enrichItemResult;
  } catch (err) {
    console.log(`[enrich] Error enrich ${link}`);

    const emptyResult: EnrichItemResult = {
      description: null,
      wordCount: null,
      publishedTime: null,
    };

    return emptyResult;
  }
}

function normalizeFeed(feed: Parser.Output<{}>): Parser.Output<{}> {
  return {
    ...feed,
    link: feed.link?.trim(),
    title: feed.title?.trim(),
    items: feed.items.map((item) => ({
      ...item,
      guid: item.guid?.trim(),
      title: item.title?.trim(),
      link: item.link?.trim(),
      creator: item.creator?.trim(),
      contentSnippet: normalizeContentSnippet(item),
    })),
  };
}

function normalizeContentSnippet(item: Parser.Item): string | undefined {
  /* We trust Atom feed authors not putting full text in the summary field */
  if (item.summary?.trim()) return item.summary.trim();

  /* When using the `content` fields, the author has an ambigous intention: it can be either full text or a synopsis. */
  if (item.content?.trim())
    return limitLength(htmlToText(item.content.trim()), SUMMARY_TRIM_ACTIVATION_THRESHOLD, SUMMARY_TRIM_TO_LENGTH);
  if (item.contentSnippet?.trim())
    return limitLength(
      htmlToText(item.contentSnippet.trim()),
      SUMMARY_TRIM_ACTIVATION_THRESHOLD,
      SUMMARY_TRIM_TO_LENGTH
    );
  return;
}

function limitLength(input: string, activationThreshold: number, trimTo: number): string {
  return input.length > activationThreshold ? `${input.slice(0, trimTo)}…` : input;
}
