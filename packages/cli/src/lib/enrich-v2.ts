import { parse } from "@osmoscraft/json-feed-parser";
import { JsonFeed, JsonFeedItem } from "@osmoscraft/json-feed-types";
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

export type EnrichedItem = JsonFeedItem<{
  // _author: string | null;
  // _wordCount: number | null;
  // _enclosure?: {
  //   url: string;
  //   type: string;
  //   length: number;
  // };
  // _itunes?: {
  //   duration?: string;
  // };
}>;

export type EnrichedFeed = JsonFeed<{}>;

const parser = new Parser({
  customFields: {
    item: ["media:thumbnail"],
  },
});

export interface EnrichConfig {
  source: Source;
  cache: Cache;
  config: Config;
}

/**
 * @returns null when enrich failed due to fatal errors
 */
export async function enrichV2(input: EnrichConfig): Promise<EnrichedFeed | null> {
  const { source, cache, config } = input;
  const cachedSource = cache.sources.find((cachedSource) => cachedSource.feedUrl === source.href);

  const startTime = performance.now();
  const xmlString = await downloadTextFile(source.href).catch((err) => {
    console.error(`[enrich] Error downloading source ${source.href}`);
    return null;
  });

  if (!xmlString) {
    if (cachedSource) {
      console.log(`[enrich] Error recovery: cache used for ${source.href}`);
      // return cachedSource;

      // TODO update cache format to JSON feed
      return null;
    } else {
      console.log(`[enrich] Error recovery: no cache available. ${source.href} is skipped.`);
      return null;
    }
  }

  const feed = await parse(xmlString)!.catch((err) => {
    console.error(`[enrich] Parse source failed ${source.href}`);
    throw err;
  });
  const items = feed.items;
  const now = Date.now();

  // TODO convert cache type
  // const cachedArticles = cache.sources.find((cachedSource) => cachedSource.feedUrl === source.href)?.articles ?? [];
  const cachedArticles: EnrichedItem[] = [];

  const newItems = items.filter((item) => cachedArticles.every((article) => article.url !== item.url));

  const newArticlesAsync: Promise<EnrichedItem | null>[] = newItems.map(async (item) => {
    if (!item.url) return null;
    return item;
  });

  const newArticles = (await Promise.all(newArticlesAsync)).filter((article) => article !== null) as EnrichedItem[];

  const combinedArticles = [...newArticles, ...cachedArticles];

  const renderedArticles = combinedArticles
    .filter((item) => {
      const elapsedDate = Math.round((now - new Date(item.date_published!).getTime()) / MILLISECONDS_PER_DAY);
      return elapsedDate < config.cacheMaxDays && elapsedDate >= 0;
    })
    .sort((a, b) => b.date_published!.localeCompare(a.date_published!)); // fix strong assertion

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);

  console.log(
    `[enrich] ${durationInSeconds.toString().padStart(4)}s | ${cachedArticles.length
      .toString()
      .padStart(3)} cached | ${(renderedArticles.length - cachedArticles.length).toString().padStart(3)} new | ${
      source.href
    }`
  );

  return {
    ...feed,
  };
}

export interface EnrichItemResult {
  description: string | null;
  wordCount: number | null;
  publishedTime: Date | null;
  imageUrl: string | null;
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

    const imageUrl = $(`meta[property="og:image"]`).attr("content") ?? null;

    const enrichItemResult: EnrichItemResult = {
      description,
      wordCount,
      publishedTime,
      imageUrl,
    };

    return enrichItemResult;
  } catch (err) {
    console.log(`[enrich] Error enrich ${link}`);
    console.log(`[enrich] Recover: plain content used for ${link}`);
    return unenrichableItem;
  }
}

const unenrichableItem: EnrichItemResult = {
  description: null,
  wordCount: null,
  publishedTime: null,
  imageUrl: null,
};

interface ParsedFeed {
  link: string | null;
  title: string | null;
  items: ParsedFeedItem[];
}

interface ParsedFeedItem {
  guid: string | null;
  title: string | null;
  link: string | null;
  isoDate: string | null;
  creator: string | null;
  summary: string | null;
  content: string | null;
  imageUrl: string | null;
  itunes?: {
    duration: string;
  };
  enclosure?: {
    url: string;
    type: string;
    length: number;
  };
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
  "media:thumbnail": string;
}

function normalizeFeed(feed: Parser.Output<CustomFields>): ParsedFeed {
  return {
    link: getNonEmptyStringOrNull(feed.link),
    title: getNonEmptyStringOrNull(feed.title),
    items: feed.items.map((item) => {
      const thumbnailImage = getNonEmptyStringOrNull(item["media:thumbnail"]);
      const enclosureImage = item.enclosure?.type.startsWith("image/")
        ? getNonEmptyStringOrNull(item.enclosure.url)
        : null;

      return {
        content: getNonEmptyStringOrNull(item.contentSnippet),
        creator: getNonEmptyStringOrNull(item.creator),
        guid: getNonEmptyStringOrNull(item.guid),
        isoDate: getNonEmptyStringOrNull(item.isoDate),
        link: getNonEmptyStringOrNull(item.link),
        summary: getNonEmptyStringOrNull(item.summary),
        title: getNonEmptyStringOrNull(item.title),
        imageUrl: thumbnailImage ?? enclosureImage,
        ...getItunesFields(item),
      };
    }),
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

const NO_ENRICH_URL_PATTERNS = ["^https?://www.youtube.com/watch"]; // Huge payload with anti crawler

function isItemEnrichable(item: ParsedFeedItem): boolean {
  if (!item.link) return false;
  if (item.itunes) return false;
  if (NO_ENRICH_URL_PATTERNS.some((pattern) => item.link!.match(pattern))) return false;

  return true;
}
