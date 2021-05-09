import fs from "fs";
import path from "path";
import { ENTRY_DIR } from "../utils/entry-dir";
import { htmlToText } from "../utils/html-to-text";
import { sanitizeHtml } from "../utils/sanitize-html";
import { cliVersion } from "../utils/version";
import type { Config } from "./get-config";
import type { EnrichedArticle } from "./enrich";
import type { UserSnippet } from "./get-user-snippets";
import { FEED_FILENAME } from "./render-atom";

export interface RenderHtmlInput {
  articles: EnrichedArticle[];
  userSnippets: UserSnippet[];
  config: Config;
}

const MAIN_CONTENT_PATTERN = /%MAIN_CONTENT%/;
const SITE_TITLE_PATTERN = /%SITE_TITLE%/g;
const FEED_FILENAME_PATTERN = /%FEED_FILENAME%/;

export function renderHtml({ articles, userSnippets: snippets, config }: RenderHtmlInput): string {
  const articlesBySourceByDates: Record<string, Record<string, EnrichedArticle[]>> = articles.reduce(
    (groupedArticles, article) => {
      const publishedOnDate = article.publishedOn.split("T")[0];
      const sourceTitle = article.sourceTitle;
      groupedArticles[publishedOnDate] ??= [];
      groupedArticles[publishedOnDate][sourceTitle] ??= [];
      groupedArticles[publishedOnDate][sourceTitle].push(article);
      return groupedArticles;
    },
    Object.create(null)
  );

  const articlesHtml = Object.entries(articlesBySourceByDates)
    .map(
      ([date, articlesBySource]) => `
    <section class="day">
      <h2 class="day-heading">${date}</h2>
      <ul class="channels">
      ${Object.entries(articlesBySource)
        .map(
          ([source, articles]) => `
          <li class="channel">
            <h3 class="channel-name"><a class="channel-name__link" href="#">${source}</a></h3>
            <section class="articles-per-source">
              ${articles
                .map(
                  (article) => `
              <article>
                <details class="article-expander">
                  <summary class="article-expander__title">${htmlToText(article.title)}</summary>
                  <div class="article-expander__body">
                    <a class="article-summary-link" href="${sanitizeHtml(article.link)}">${htmlToText(
                    article.description
                  )}</a>
                    <div class="article-meta">
                    ${[
                      `<a class="article-meta__item article-meta__item--link" href="${sanitizeHtml(
                        article.link
                      )}" target="_blank">New tab</a>`,
                      ...(article.wordCount
                        ? [`<span class="article-meta__item">${Math.round(article.wordCount / 300)} min read</span>`]
                        : []),
                    ].join(" · ")}
                    </div>
                  </div>
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
