import { htmlToText } from "../utils/html-to-text";
import { cliVersion } from "../utils/version";
import type { EnrichedArticle, EnrichedSource } from "./enrich";
import type { Config } from "./get-config";
import { FEED_FILENAME } from "./render-atom";

export interface GetTemplateDataOutput {
  /** Array of dates, each containing the content published on the date */
  dates: TemplateDates[];
  /** Array of source, each containing the content published from the source */
  sources: TemplateSource[];
  /** Array of articles, most recent first */
  articles: TemplateArticle[];

  /** npm package version of the builder */
  cliVersion: string;
  /** URL for the generated atom feed */
  feedHref: string;
  /** URL for the osmosfeed project */
  projectUrl: string;
  /** ISO timestamp for the build */
  siteBuildTimestamp: string;

  siteTitle: string;
}

interface TemplateArticle extends EnrichedArticle {
  source: EnrichedSource;
  isoPublishDate: string;
  isoLatestPublishTime: string;
  readingTimeInMin: number;
}

interface TemplateSource extends TemplateSourceBase {
  dates: {
    isoLatestPublishTime: string;
    isoPublishDate: string;
    articles: TemplateArticle[];
  }[];
}

interface TemplateDates {
  isoPublishDate: string;
  isoLatestPublishTime: string;
  articles: TemplateArticle[];
  sources: TemplateSourceBase[];
}

interface TemplateSourceBase extends EnrichedSource {
  isoLatestPublishTime: string;
  articles: TemplateArticle[];
}

export interface GetTemplateDataInput {
  enrichedSources: EnrichedSource[];
  config: Config;
}

export function getTemplateData(input: GetTemplateDataInput): GetTemplateDataOutput {
  return {
    get dates() {
      return organizeByDates(input.enrichedSources);
    },

    get sources() {
      return organizeBySources(input.enrichedSources);
    },

    get articles() {
      return organizeByArticles(input.enrichedSources);
    },

    cliVersion,
    siteTitle: input.config.siteTitle,
    siteBuildTimestamp: new Date().toISOString(),
    projectUrl: `https://github.com/osmoscraft/osmosfeed`,
    feedHref: FEED_FILENAME,
  };
}

function organizeByArticles(enrichedSources: EnrichedSource[]): TemplateArticle[] {
  const articles: TemplateArticle[] = enrichedSources
    .flatMap((enrichedSource) =>
      enrichedSource.articles.map((article) => ({
        ...article,
        source: enrichedSource,
        isoPublishDate: article.publishedOn.split("T")[0],
        isoLatestPublishTime: article.publishedOn,
        title: ensureDisplayString(htmlToText(article.title), "Untitled"),
        description: ensureDisplayString(htmlToText(article.description), "No content preview"),
        readingTimeInMin: Math.round((article.wordCount ?? 0) / 300),
      }))
    )
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)); // by time, most recent first
  return articles;
}

function organizeBySources(enrichedSources: EnrichedSource[]): TemplateSource[] {
  const articles = organizeByArticles(enrichedSources);

  const articlesBySource = groupBy(articles, (article) => article.source);
  const sortedArticlesBySource = [...articlesBySource.entries()].map(([source, articles]) => ({
    ...source,
    isoLatestPublishTime: articles[0].isoLatestPublishTime, // due to groupBy, articles array won't be empty
    articles: articles.sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)), // by date, most recent first
    dates: [...groupBy(articles, (article) => article.isoPublishDate)]
      .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
      .map(([date, articles]) => ({
        isoLatestPublishTime: articles[0].isoLatestPublishTime, // due to groupBy, articles array won't be empty
        isoPublishDate: date,
        articles,
      })),
  }));

  return sortedArticlesBySource;
}

function organizeByDates(enrichedSources: EnrichedSource[]): TemplateDates[] {
  const articles = organizeByArticles(enrichedSources);

  const articlesByDate = groupBy(articles, (article) => article.isoPublishDate);
  const sortedArticlesByDate = [...articlesByDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
    .map(([date, articles]) => ({
      isoPublishDate: date,
      isoLatestPublishTime: articles[0].isoLatestPublishTime, // due to groupBy, articles array won't be empty
      articles,
      sources: [...groupBy(articles, (articles) => articles.source).entries()]
        .sort((a, b) => b[1][0].isoLatestPublishTime.localeCompare(a[1][0].isoLatestPublishTime)) // by date, most recent first
        .map(([source, articles]) => ({
          ...source,
          isoLatestPublishTime: articles[0].isoLatestPublishTime, // due to groupBy, articles array won't be empty
          articles,
        })),
    }));

  return sortedArticlesByDate;
}

function groupBy<T, K>(array: T[], selector: (item: T) => K) {
  const result = new Map<K, T[]>();
  return array.reduce((latest, item) => {
    const feature = selector(item);

    if (!latest.has(feature)) {
      latest.set(feature, [item]);
    } else {
      latest.get(feature)!.push(item);
    }

    return latest;
  }, result);
}

function ensureDisplayString(input: string | null | undefined, fallback: string) {
  return input?.length ? input : fallback;
}
