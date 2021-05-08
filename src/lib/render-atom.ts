import { Feed } from "feed";
import { cliVersion } from "../utils/version";
import { CACHE_FILENAME } from "./cache";
import type { Config } from "./get-config";
import type { EnrichedArticle } from "./enrich";

export const FEED_FILENAME = "feed.atom";
export const INDEX_FILENAME = "index.html";

export interface RenderAtomInput {
  articles: EnrichedArticle[];
  config: Config;
}

export function renderAtom({ articles, config }: RenderAtomInput): string {
  const nowTimestamp = new Date().toISOString();
  const siteUrl = config.cacheUrl?.replace(CACHE_FILENAME, INDEX_FILENAME);
  const feedUrl = config.cacheUrl?.replace(CACHE_FILENAME, FEED_FILENAME);
  const feedId = siteUrl ?? `urn:${nowTimestamp}`; // cacheUrl is required. Fallback value for testing only.
  const feedLinks = feedUrl ? { atom: feedUrl } : undefined;

  const feed = new Feed({
    title: config.siteTitle,
    updated: new Date(),
    id: feedId,
    generator: `osmosfeed ${cliVersion}`,
    link: siteUrl ?? INDEX_FILENAME,
    feedLinks,
    description: "",
    copyright: "",
  });

  articles.forEach((article) => {
    feed.addItem({
      title: article.title,
      id: article.id,
      description: article.description,
      link: article.link,
      author: [
        {
          name: article.author ?? article.sourceTitle ?? "Unknown author",
        },
      ],
      date: new Date(article.publishedOn),
    });
  });

  const atomXml = feed.atom1();

  return atomXml;
}
