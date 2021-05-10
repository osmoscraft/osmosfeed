import fs from "fs";
import path from "path";
import { ENTRY_DIR } from "../utils/entry-dir";
import { htmlToText } from "../utils/html-to-text";
import { sanitizeHtml } from "../utils/sanitize-html";
import { cliVersion } from "../utils/version";
import type { Config } from "./get-config";
import type { EnrichedArticle, EnrichedSource } from "./enrich";
import type { UserSnippet } from "./get-user-snippets";
import { FEED_FILENAME } from "./render-atom";
import { getHostnameFromUrl } from "../utils/get-hostname-from-url";

export interface RenderHtmlInput {
  enrichedSources: EnrichedSource[];
  userSnippets: UserSnippet[];
  config: Config;
}

const MAIN_CONTENT_PATTERN = /%MAIN_CONTENT%/;
const SITE_TITLE_PATTERN = /%SITE_TITLE%/g;
const FEED_FILENAME_PATTERN = /%FEED_FILENAME%/;

interface DisplayDayModel {
  date: string;
  sources: DisplaySource[];
}

interface DisplaySource {
  title: string | null;
  siteUrl: string | null;
  feedUrl: string;
  articles: EnrichedArticle[];
}

export function renderHtml({ enrichedSources, userSnippets: snippets, config }: RenderHtmlInput): string {
  const displayDays: DisplayDayModel[] = [];

  // Group articles by date
  enrichedSources.forEach((source) => {
    source.articles.forEach((article) => {
      const publishedOnDate = article.publishedOn.split("T")[0];
      let currentDay = displayDays.find((day) => day.date === publishedOnDate);
      if (!currentDay) {
        currentDay = {
          date: publishedOnDate,
          sources: [],
        };
        displayDays.push(currentDay);
      }

      let currentSource = currentDay.sources.find((displaySource) => displaySource.feedUrl === source.feedUrl);
      if (!currentSource) {
        currentSource = {
          ...source,
          title: source.title ?? getHostnameFromUrl(source.siteUrl) ?? getHostnameFromUrl(source.feedUrl),
          articles: [],
        };
        currentDay.sources.push(currentSource);
      }

      currentSource.articles.push(article);
    });
  });

  displayDays.sort((a, b) => b.date.localeCompare(a.date));

  const articlesHtml = displayDays
    .map(
      (displayDay) => `
    <section class="daily-content">
      <h2 class="daily-heading">${displayDay.date}</h2>
      <ul class="sources card">
      ${displayDay.sources
        .map(
          (source) => `
          <li class="source">
            <h3 class="source-name"><a class="source-name__link" href="${source.siteUrl}">${source.title}</a></h3>
            <section class="articles-per-source">
              ${source.articles
                .map(
                  (article) => `
              <article>
                <details class="article-expander">
                  <summary class="article-expander__title">${sanitizeHtml(article.title)}</summary>
                  <a class="article-summary-link article-summary-box-outer" href="${sanitizeHtml(article.link)}">
                    <div class="article-summary-box-inner">
                      <span class="article-reading-time">(&#8202;${Math.round(
                        (article.wordCount ?? 0) / 300
                      )} min&#8202;)</span>
                      <span>${htmlToText(article.description)}</span>
                    </div>
                  </a>
                </details>
              </article>`
                )
                .join("\n")}
            </section>
          </li>
          `
        )
        .join("\n")}
      </ul>  
    </section>
    `
    )
    .join("\n").concat(`
    <footer>
      <time id="build-timestamp" datetime="${new Date().toISOString()}">${new Date().toISOString()}</time>
      <span><a class="footer-link" href="https://github.com/osmoscraft/osmosfeed">osmosfeed ${cliVersion}</a></span>
    </footer>
    `);

  const template = fs.readFileSync(path.resolve(ENTRY_DIR, "index-template.html"), "utf8");
  const hydratedTemplate = template
    .replace(MAIN_CONTENT_PATTERN, articlesHtml)
    .replace(FEED_FILENAME_PATTERN, FEED_FILENAME)
    .replace(SITE_TITLE_PATTERN, config.siteTitle); // TODO use `replaceAll` once we bump github workflow to node v16 LTS

  const customizedTemplate = snippets.reduce(
    (currentTemplate, snippet) => currentTemplate.replace(snippet.replaceFrom, snippet.replaceTo),
    hydratedTemplate
  );

  return customizedTemplate;
}
