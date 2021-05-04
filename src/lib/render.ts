import fs from "fs";
import path from "path";
import { ENTRY_DIR } from "../utils/entry-dir";
import { htmlToText } from "../utils/html-to-text";
import { sanitizeHtml } from "../utils/sanitize-html";
import { cliVersion } from "../utils/version";
import type { EnrichedArticle } from "./enrich";

export interface RenderProps {
  articles: EnrichedArticle[];
}

export function render({ articles }: RenderProps): string {
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
    <section class="day-container">
    <h2>${date}</h2>
    ${Object.entries(articlesBySource)
      .map(
        ([source, articles]) => `
        <h3>${source}</h3>
        <section class="articles-per-source">
          ${articles
            .map(
              (article) => `
          <article>
            <details>
              <summary>${htmlToText(article.title)}</summary>
              <div class="details-content">
                <p>${htmlToText(article.description)}</p>
                <a href="${sanitizeHtml(article.link)}" target="_blank">${
                article.wordCount ? `Read · ${Math.round(article.wordCount / 300)} min` : "Read"
              }</a>
              </div>
            </details>
          </article>`
            )
            .join("\n")}
        </section>
        `
      )
      .join("\n")}
    </section>
    `
    )
    .join("\n").concat(`
    <footer>
      <time id="build-timestamp" datetime="${new Date().toISOString()}">${new Date().toISOString()}</time>
      <span><a href="https://github.com/osmoscraft/osmosfeed" target="_blank">osmosfeed ${cliVersion}</a></span>
    </footer>
    `);

  const template = fs.readFileSync(path.resolve(ENTRY_DIR, "index-template.html"), "utf8");
  const hydratedTemplate = template.replace("%CONTENT%", articlesHtml);

  return hydratedTemplate;
}
