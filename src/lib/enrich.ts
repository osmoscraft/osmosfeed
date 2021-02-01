import axios from "axios";
import cheerio from "cheerio";
import * as htmlparse2 from "htmlparser2";
import { htmlToText } from "../utils/html-to-text";
import type { Source } from "./config";
import type { Cache } from "./cache";
import { performance } from "perf_hooks";

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

export async function enrich(source: Source, cache: Cache): Promise<EnrichedSource> {
  const startTime = performance.now();
  const response = await axios.get(source.href);
  const xmlString = response.data;
  const feed = htmlparse2.parseFeed(xmlString)!; // TODO error checking

  const items = feed.items ?? [];
  const now = Date.now();

  const cachedArticles = cache.sources.find((cachedSource) => cachedSource.href === source.href)?.articles ?? [];

  const newItems = items.filter((item) => cachedArticles.every((article) => article.link !== item.link));

  const newArticlesAsync: Promise<EnrichedArticle | null>[] = newItems.map(async (item) => {
    const { title, link, pubDate = new Date(), description = "" } = item;

    if (!link) return null;

    const enrichedItem = await enrichItem(link);

    const enrichedArticle: EnrichedArticle = {
      description: enrichedItem.description ?? htmlToText(description).slice(0, 512),
      link,
      publishedOn: pubDate.toISOString(),
      wordCount: enrichedItem.wordCount,
      sourceHref: source.href,
      sourceTitle: feed.title ?? feed.id ?? "",
      title: title ?? "Untitled",
    };

    return enrichedArticle;
  });

  const newArticles = (await Promise.all(newArticlesAsync)).filter((article) => article !== null) as EnrichedArticle[];

  const combinedArticles = [...newArticles, ...cachedArticles];
  const allArticles = combinedArticles
    .filter((item) => Math.round((now - new Date(item.publishedOn).getTime()) / 1000 / 60 / 60 / 24) < 14) // must be within 14 days
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);

  console.log(
    `[enrich] ${durationInSeconds.toString().padStart(4)}s | ${newItems.length
      .toString()
      .padStart(3)} new | ${allArticles.length.toString().padStart(3)} total | ${source.href}`
  );

  return {
    href: source.href,
    articles: allArticles,
  };
}

export interface EnrichItemResult {
  description: string | null;
  wordCount: number | null;
}

async function enrichItem(link: string) {
  try {
    const response = await axios.get(link);
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

    const enrichItemResult: EnrichItemResult = {
      description,
      wordCount,
    };

    return enrichItemResult;
  } catch (err) {
    console.error(`[enrich] parse item error ${link}`, err);

    const emptyResult: EnrichItemResult = {
      description: null,
      wordCount: null,
    };

    return emptyResult;
  }
}
