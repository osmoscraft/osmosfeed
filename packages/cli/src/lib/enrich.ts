import cheerio from "cheerio";
import { performance } from "perf_hooks";
import Parser from "rss-parser";
import { downloadTextFile } from "../utils/download";
import { getNonEmptyStringOrNull } from "../utils/ensure-string-content";
import { getFirstNonNullItem } from "../utils/get-first-non-null-item";
import { htmlToText } from "../utils/html-to-text";
import { trimWithThreshold } from "../utils/trim-with-threshold";
import type { Cache } from "./get-cache";
import type { Config, Source } from "./get-config";

const MILLISECONDS_PER_DAY = 86400000; // 1000 * 60 * 60 * 24
const SUMMARY_TRIM_ACTIVATION_THRESHOLD = 2048; // characters
const SUMMARY_TRIM_TO_LENGTH = 800; // characters

export interface EnrichedArticle {
  id: string;
  author: string | null;
  description: string; // TODO in next major release, use `summary` instead, so as to distinguish from `content`
  link: string;
  publishedOn: string;
  title: string;
  wordCount: number | null;
  enclosure?: {
    url: string;
    type: string;
    length: number;
  };
  itunes?: {
    duration?: string;
  };
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

    const enrichedItem = await enrichItem(link);
    const description = getSummary({ parsedItem: item, enrichedItem: enrichedItem });
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
      itunes: item.itunes,
      enclosure: item.enclosure,
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

interface ParsedFeed {
  link: string | null;
  title: string | null;
  items: ParsedFeedItem[];
}

interface ParsedFeedItem extends CustomFields {
  guid: string | null;
  title: string | null;
  link: string | null;
  isoDate: string | null;
  creator: string | null;
  summary: string | null;
  content: string | null;
}

interface CustomFields {
  itunes?: {
    duration: string;
  };
  enclosure?: {
    url: string;
    type: string;
    length: number;
  };
}

function normalizeFeed(feed: Parser.Output<CustomFields>): ParsedFeed {
  return {
    link: getNonEmptyStringOrNull(feed.link),
    title: getNonEmptyStringOrNull(feed.title),
    items: feed.items.map((item) => ({
      content: getNonEmptyStringOrNull(item.contentSnippet),
      creator: getNonEmptyStringOrNull(item.creator),
      guid: getNonEmptyStringOrNull(item.guid),
      isoDate: getNonEmptyStringOrNull(item.isoDate),
      link: getNonEmptyStringOrNull(item.link),
      summary: getNonEmptyStringOrNull(item.summary),
      title: getNonEmptyStringOrNull(item.title),
      ...getItunesFields(item),
    })),
  };
}

function getItunesFields(itunesItem: CustomFields) {
  const itunes = itunesItem.itunes
    ? {
        duration: itunesItem.itunes.duration,
      }
    : undefined;

  const enclosure = itunesItem.enclosure
    ? {
        ...itunesItem.enclosure,
      }
    : undefined;

  return {
    itunes,
    enclosure,
  };
}

// TODO improve summary accuracy
// when `content:encodedSnippet` exists and differs from content, we can assume content is the summary.
function getSummary(input: GetSummaryInput): string {
  return getFirstNonNullItem(
    input.parsedItem.summary,
    input.parsedItem.content
      ? trimWithThreshold(input.parsedItem.content, SUMMARY_TRIM_ACTIVATION_THRESHOLD, SUMMARY_TRIM_TO_LENGTH)
      : null,
    input.enrichedItem.description,
    ""
  );
}

interface GetSummaryInput {
  parsedItem: ParsedFeedItem;
  enrichedItem: EnrichItemResult;
}
