import axios from "axios";
import cheerio from "cheerio";
import * as htmlparse2 from "htmlparser2";
import { replaceHtmlTags } from "../utils/escape-html-tags";
import type { Source } from "./config";
import type { Cache } from "./cache";

export interface EnrichedArticle {
  sourceHref: string;
  sourceTitle: string;
  title: string;
  description: string;
  link: string;
  ageInDays: number;
  publishedOn: string;
}

export interface EnrichedSource {
  href: string;
  articles: EnrichedArticle[];
}

export async function enrich(source: Source, cache: Cache): Promise<EnrichedSource> {
  const response = await axios.get(source.href);
  const xmlString = response.data;
  const feed = htmlparse2.parseFeed(xmlString)!; // TODO error checking

  const items = feed.items ?? [];
  const now = Date.now();

  const cachedArticles = cache.articles.filter((articles) => articles.sourceHref === source.href);

  const recentItems = items.filter((item) => Math.round((now - item.pubDate!.getTime()) / 1000 / 60 / 60 / 24) < 14);
  const newItems = recentItems.filter((item) => cachedArticles.every((article) => article.link !== item.link));

  const newArticles: EnrichedArticle[] = newItems.map((item) => {
    const { title, link = "", pubDate, description = "" } = item;

    const descriptionParsed = cheerio.load(description);
    const descriptionPlainText = replaceHtmlTags(descriptionParsed.root().text()).trim().slice(0, 1024);

    // TODO enhance result with Mercury parser
    // TODO use cache to prevent refetching

    const enrichedArticle: EnrichedArticle = {
      sourceHref: source.href,
      sourceTitle: feed.title ?? feed.id ?? "",
      title: title ?? "Untitled",
      description: descriptionPlainText,
      link,
      ageInDays: Math.round((now - pubDate!.getTime()) / 1000 / 60 / 60 / 24),
      publishedOn: pubDate!.toISOString(),
    };

    return enrichedArticle;
  });

  const allArticles = [...newArticles, ...cachedArticles];

  console.log(`[enrich] ${newItems.length} new | ${allArticles.length} total | ${source.href}`);

  return {
    href: source.href,
    articles: allArticles,
  };
}
