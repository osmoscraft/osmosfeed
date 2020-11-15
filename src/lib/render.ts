import fs from "fs";
import path from "path";
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
            <div class="title-assembly">
              <span class="actions">
                <button data-action="preview">+</button>
              </span>
              <a href="${article.link}">
              ${article.title}
              </a>
            </div>
            <p class="article-details">${article.description}</p>
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
    .join("\n");

  const template = fs.readFileSync(path.resolve("src/index-template.html"), "utf8");
  const hydratedTemplate = template.replace("%CONTENT%", articlesHtml);

  return hydratedTemplate;
}
