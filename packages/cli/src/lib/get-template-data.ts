import { htmlToText } from "../utils/html-to-text";
import { cliVersion } from "../utils/version";
import type { EnrichedArticle, EnrichedSource } from "./enrich";
import type { Config } from "./get-config";
import { FEED_FILENAME } from "./render-atom";
import { getDateFromIsoString, getIsoTimeWithOffset } from "./time";

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
  /**
   * @deprecated This date should only be used by the server internally.
   * Use `isoUtcPublishTime` for high-fidelity timestamp or `isoOffsetPublishDate` for grouping by dates
   */
  isoPublishDate: string;
  /**
   * The publish date in user's specified timezone (UTC by default)
   */
  isoOffsetPublishDate: string;
  /**
   * The publish time in UTC timezone
   */
  isoUtcPublishTime: string;
  readingTimeInMin: number;
}

interface TemplateSource extends TemplateSourceBase {
  dates: {
    /**
     * @deprecated This date should only be used by the server internally.
     * Use `isoUtcPublishTime` for high-fidelity timestamp or `isoOffsetPublishDate` for grouping by dates
     */
    isoPublishDate: string;
    isoOffsetPublishDate: string;
    isoUtcPublishTime: string;
    articles: TemplateArticle[];
  }[];
}

interface TemplateDates {
  /**
   * @deprecated This date should only be used by the server internally.
   * Use `isoUtcPublishTime` for high-fidelity timestamp or `isoOffsetPublishDate` for grouping by dates
   */
  isoPublishDate: string;
  isoOffsetPublishDate: string;
  isoUtcPublishTime: string;
  articles: TemplateArticle[];
  sources: TemplateSourceBase[];
}

interface TemplateSourceBase extends EnrichedSource {
  isoOffsetPublishDate: string;
  isoUtcPublishTime: string;
  articles: TemplateArticle[];
}

export interface GetTemplateDataInput {
  enrichedSources: EnrichedSource[];
  config: Config;
}

export function getTemplateData(input: GetTemplateDataInput): GetTemplateDataOutput {
  return {
    get dates() {
      return organizeByDates(input);
    },

    get sources() {
      return organizeBySources(input);
    },

    get articles() {
      return organizeByArticles(input);
    },

    cliVersion,
    siteTitle: input.config.siteTitle,
    siteBuildTimestamp: new Date().toISOString(),
    projectUrl: `https://github.com/osmoscraft/osmosfeed`,
    feedHref: FEED_FILENAME,
  };
}

function getTimestamps(isoUtcTimestamp: string, timezoneOffset: number) {
  const isoOffsetTime = getIsoTimeWithOffset(isoUtcTimestamp, timezoneOffset);
  return {
    isoUtcPublishTime: isoUtcTimestamp,
    isoOffsetPublishDate: getDateFromIsoString(isoOffsetTime),
  };
}

function organizeByArticles(input: GetTemplateDataInput): TemplateArticle[] {
  const articles: TemplateArticle[] = input.enrichedSources
    .flatMap((enrichedSource) =>
      enrichedSource.articles.map((article) => ({
        ...article,
        source: enrichedSource,
        isoPublishDate: getDateFromIsoString(article.publishedOn),
        ...getTimestamps(article.publishedOn, input.config.timezoneOffset),
        title: ensureDisplayString(htmlToText(article.title), "Untitled"),
        description: ensureDisplayString(htmlToText(article.description), "No content preview"),
        readingTimeInMin: Math.round((article.wordCount ?? 0) / 300),
      }))
    )
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)); // by time, most recent first
  return articles;
}

function organizeBySources(input: GetTemplateDataInput): TemplateSource[] {
  const articles = organizeByArticles(input);

  const articlesBySource = groupBy(articles, (article) => article.source);
  const sortedArticlesBySource = [...articlesBySource.entries()].map(([source, articles]) => ({
    ...source,
    ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
    articles: articles.sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)), // by date, most recent first
    dates: [...groupBy(articles, (article) => article.isoOffsetPublishDate)]
      .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
      .map(([date, articles]) => ({
        isoPublishDate: date,
        ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
        articles,
      })),
  }));

  return sortedArticlesBySource;
}

function organizeByDates(input: GetTemplateDataInput): TemplateDates[] {
  const articles = organizeByArticles(input);

  const articlesByDate = groupBy(articles, (article) => article.isoOffsetPublishDate);
  const sortedArticlesByDate = [...articlesByDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
    .map(([date, articles]) => ({
      isoPublishDate: date,
      ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
      articles,
      sources: [...groupBy(articles, (articles) => articles.source).entries()]
        .sort((a, b) => b[1][0].isoUtcPublishTime.localeCompare(a[1][0].isoUtcPublishTime)) // by date, most recent first
        .map(([source, articles]) => ({
          ...source,
          ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
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
