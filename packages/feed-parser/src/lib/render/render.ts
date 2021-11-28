import type { JsonFeed, JsonFeedItem } from "../json-feed";
import { sanitizeHtml } from "./sanitize";

export interface SiteModel {
  data: JsonFeed[];
  assets: Asset[];
}

export interface Asset {
  type: "script" | "stylesheet";
  href: string;
}

export function renderSite(model: SiteModel) {
  return `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>osmos::feed</title>
    ${model.assets
      .filter((asset) => asset.type === "stylesheet")
      .map((asset) => `<link rel="stylesheet" href="${asset.href}">`)
      .join("\n")}
	</head>
	<body>
    <osmos-app>
      <div class="c-feed-list">
      ${model.data.map((channel) => renderChannel({ parent: model, data: channel })).join("\n")}
      </div>
    </osmos-app>
    ${model.assets
      .filter((asset) => asset.type === "script")
      .map((asset) => `<script type="module" src="${asset.href}"></script>`)
      .join("\n")}
	</body>
</html>
`.trim();
}

export interface ChannelModel {
  data: JsonFeed;
  parent: SiteModel;
}
export function renderChannel(model: ChannelModel) {
  return `
<osmos-channel>
  <section class="feed js-horizontal-scroll">
    <h1 class="feed-title-group">
      ${model.data.icon ? `<img class="feed-icon" src="${model.data.icon}" width="32" height="32">` : ``}
      <a class="u-reset" href="${model.data.home_page_url}">${sanitizeHtml(model.data.title)}</a>
    </h1>
    <button class="js-horizontal-scroll__backward">&lt;</button>
    <button class="js-horizontal-scroll__forward">&gt;</button>
    <div class="u-hide-scrollbar article-list js-horizontal-scroll__list">
      ${model.data.items.map((item) => renderItem({ data: item, parent: model })).join("\n")}
    </div>
  </section>
</osmos-channel>
  `.trim();
}

export interface ItemModel {
  data: JsonFeedItem;
  parent: ChannelModel;
}
export function renderItem(model: ItemModel) {
  const sensibleTimestamp = model.data.date_modified ?? model.data.date_published;

  return `
<osmos-article>
  <article class="article js-horizontal-scroll__item">
    ${model.data.image ? `<img class="article__image" src="${model.data.image}">` : ""}
    <a class="u-reset" href="#" data-read-url="${model.data.url}">
      <h2 class="article__title">${sanitizeHtml(model.data.title)}</h2>
    </a>
    ${sensibleTimestamp ? `<time class="js-datetime" datetime="${sensibleTimestamp}">${sensibleTimestamp}</time>` : ""}
    <a class="u-reset" href="#" data-read-url="${model.data.url}">
      <p class="article__summary">${sanitizeHtml(model.data.summary)}</p>
    </a>
    <a class="u-reset" href="${model.data.url}">Open original</a>
  </article>
</osmos-article>
  `.trim();
}
