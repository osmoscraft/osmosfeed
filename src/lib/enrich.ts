import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";
import cheerio from "cheerio";
import { performance } from "perf_hooks";
import Parser from "rss-parser";
import { htmlToText } from "../utils/html-to-text";
import type { Cache } from "./cache";
import type { Config, Source } from "./config";

const FETCH_TIMEOUT_MS = 15000; // 15 seconds
const FETCH_RETRY = 2; // 2 retries after initial fail
const MILLISECONDS_PER_DAY = 86400000; // 1000 * 60 * 60 * 24
const MAX_DESCRIPTION_LENGTH = 512; // characters

export interface EnrichedArticle {
  description: string;
  link: string;
  publishedOn: string;
  sourceHref: string;
  sourceTitle: string;
  title: string;
  wordCount: number | null;
}

export interface EnrichedSource {
  href: string;
  articles: EnrichedArticle[];
}

const parser = new Parser();

export interface EnrichInput {
  source: Source;
  cache: Cache;
  config: Config;
}

export async function enrich(enrichInput: EnrichInput): Promise<EnrichedSource> {
  return enrichWithRetry(enrichInput, FETCH_RETRY);
}

export async function enrichWithRetry(enrichInput: EnrichInput, retryLeft = FETCH_RETRY): Promise<EnrichedSource> {
  const { source, cache, config } = enrichInput;

  const startTime = performance.now();
  let response: AxiosResponse;
  try {
    response = await axios.get(source.href, { timeout: FETCH_TIMEOUT_MS });
  } catch (err) {
    const axiosError = err as AxiosError;
    console.error(`[enrich] Fetch source error ${source.href}`, axiosError?.code ?? axiosError?.message ?? axiosError);

    if (retryLeft > 0) {
      console.log(`[enrich] ${retryLeft} retry left.`);
      return enrichWithRetry(enrichInput, retryLeft - 1);
    } else {
      console.log(`[enrich] No retry left. Fetch source failed.`);
      throw err;
    }
  }

  const xmlString = response.data;
  const rawFeed = await parser.parseString(xmlString)!.catch(err => {
    console.error(`[enrich] Parse source failed ${source.href}`);
    throw err;
  });
  const feed = normalizeFeed(rawFeed);
  const items = feed.items;
  const now = Date.now();

  const cachedArticles = cache.sources.find((cachedSource) => cachedSource.href === source.href)?.articles ?? [];

  const newItems = items.filter((item) => cachedArticles.every((article) => article.link !== item.link));

  const newArticlesAsync: Promise<EnrichedArticle | null>[] = newItems.map(async (item) => {
    const sourceTitle = feed.title ?? "Untitled";
    const title = item.title ?? "Untitled";
    const link = item.link;

    if (!link) return null;

    const enrichedItem = await enrichItem(link);
    const description = item.contentSnippet ?? enrichedItem.description ?? "";
    const publishedOn = item.isoDate ?? enrichedItem.publishedTime?.toISOString() ?? new Date().toISOString();

    const enrichedArticle: EnrichedArticle = {
      description,
      link,
      publishedOn,
      wordCount: enrichedItem.wordCount,
      sourceHref: source.href,
      sourceTitle,
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
    href: source.href,
    articles: renderedArticles,
  };
}

export interface EnrichItemResult {
  description: string | null;
  wordCount: number | null;
  publishedTime: Date | null;
}

async function enrichItem(link: string, retryLeft = FETCH_RETRY): Promise<EnrichItemResult> {
  try {
    const response = await axios.get(link, { timeout: FETCH_TIMEOUT_MS });
    const responseHtml = response.data;
    if (response.status !== 200 || typeof responseHtml !== "string") {
      throw new Error(`Error download ${link}`);
    }

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
    const axiosError = err as AxiosError;
    console.error(`[enrich] Enrich item error ${link}`, axiosError?.code ?? axiosError?.message ?? axiosError);

    if (retryLeft > 0) {
      console.log(`[enrich] ${retryLeft} retry left.`);
      return enrichItem(link, retryLeft - 1);
    } else {
      console.log(`[enrich] No retry left. Enrich item failed.`);
    }

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
    title: feed.title?.trim(),
    items: feed.items.map((item) => ({
      ...item,
      title: item.title?.trim(),
      link: item.link?.trim(),
      contentSnippet: normalizeContentSnippet(item),
    })),
  };
}

function normalizeContentSnippet(item: Parser.Item): string | undefined {
  if (item.content?.trim()) return limitLength(htmlToText(item.content.trim()), MAX_DESCRIPTION_LENGTH);
  if (item.contentSnippet?.trim()) return limitLength(htmlToText(item.contentSnippet.trim()), MAX_DESCRIPTION_LENGTH);
  return;
}

function limitLength(input: string, length: number): string {
  return input.length > length ? `${input.slice(0, length)}…` : input;
}
