import { ParsedItem } from "..";
import fs from "fs";
import path from "path";

export interface RenderProps {
  posts: ParsedItem[];
}

export function render({ posts }: RenderProps): string {
  const postsBySourceByDates: Record<string, Record<string, ParsedItem[]>> = posts.reduce((groupedPosts, post) => {
    const publishedOnDate = post.publishedOn.split("T")[0];
    const sourceTitle = post.sourceTitle;
    groupedPosts[publishedOnDate] ??= [];
    groupedPosts[publishedOnDate][sourceTitle] ??= [];
    groupedPosts[publishedOnDate][sourceTitle].push(post);
    return groupedPosts;
  }, Object.create(null));

  const postsHtml = Object.entries(postsBySourceByDates)
    .map(
      ([date, postsBySource]) => `
    <section class="day-container">
    <h2>${date}</h2>
    ${Object.entries(postsBySource)
      .map(
        ([source, posts]) => `
        <h3>${source}</h3>
        <section class="articles-per-source">
          ${posts
            .map(
              (post) => `
          <article>
            <div class="title-assembly">
              <span class="actions">
                <button data-action="preview">+</button>
              </span>
              <a href="${post.link}">
              ${post.title}
              </a>
            </div>
            <p class="article-details">${post.description}</p>
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
  const hydratedTemplate = template.replace("%CONTENT%", postsHtml);

  return hydratedTemplate;
}
