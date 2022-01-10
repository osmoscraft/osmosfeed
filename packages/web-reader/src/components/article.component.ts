import { JsonFeedItem } from "@osmosfeed/types";
import { sanitizeHtml } from "../utils/sanitize";
import { ChannelModel } from "./channel.component";

export interface ItemModel {
  data: JsonFeedItem;
  parent: ChannelModel;
}
export function Article(model: ItemModel) {
  const sensibleTimestamp = model.data.date_modified ?? model.data.date_published;

  return `
<osmos-article data-page-filename="${model.data._plugin.pageFilename}">
  <article class="article js-horizontal-scroll__item">
    ${model.data.image ? `<img class="article__image" loading="lazy" src="${model.data.image}">` : ""}
      <h2 class="article__title">
        <a href="${model.data.url}" data-page-url="${model.data.url}" data-page-filename="${
    model.data._plugin.pageFilename
  }">${sanitizeHtml(model.data.title)}</a>
      </h2>
    ${sensibleTimestamp ? `<time class="js-datetime" datetime="${sensibleTimestamp}">${sensibleTimestamp}</time>` : ""}
    <p class="article__summary">${sanitizeHtml(model.data.summary)}</p>
  </article>
</osmos-article>
  `.trim();
}
