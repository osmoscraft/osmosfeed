import { JsonFeedChannel } from "@osmoscraft/osmosfeed-core";
import { sanitizeHtml } from "../utils/sanitize";
import { Article } from "./article.component";
import { AppModel } from "./app.component";

export interface ChannelModel {
  data: JsonFeedChannel;
  parent: AppModel;
}
export function Channel(model: ChannelModel) {
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
      ${model.data.items.map((item) => Article({ data: item, parent: model })).join("\n")}
    </div>
  </section>
</osmos-channel>
  `.trim();
}

export class ChannelElement extends HTMLElement {
  lastUpdated?: Date;

  connectedCallback() {
    this.formatDatetime();
    this.observeSlideVisibility();
    this.handleSlideControl();
  }

  private formatDatetime() {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    [...this.querySelectorAll<HTMLTimeElement>(".js-datetime")].forEach((datetime) => {
      const currentEpoc = Date.now();
      const sourceEpoc = new Date(datetime.dateTime).getTime();
      const relativeDays = Math.floor((sourceEpoc - currentEpoc) / 1000 / 60 / 60 / 24);
      datetime.innerText = rtf.format(relativeDays, "day");
    });
  }

  private handleSlideControl() {
    this.addEventListener("click", (e) => {
      const isForward = (e.target as HTMLElement).closest(".js-horizontal-scroll__forward") !== null;
      const isBackward = (e.target as HTMLElement).closest(".js-horizontal-scroll__backward") !== null;
      if (isForward || isBackward) {
        const scrollAssembly = (e.target as HTMLElement).closest(".js-horizontal-scroll")!;
        const list = scrollAssembly.querySelector(".js-horizontal-scroll__list") as HTMLElement;
        if (isForward) {
          list.scroll({
            left: list.scrollLeft + list.offsetWidth,
            behavior: "smooth",
          });
        } else {
          list.scroll({
            left: list.scrollLeft - list.offsetWidth,
            behavior: "smooth",
          });
        }
      }
    });
  }

  private observeSlideVisibility() {
    const lists = document.querySelectorAll(".js-horizontal-scroll__list");

    lists.forEach((list) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            const group = e.target.closest(".js-horizontal-scroll")!;
            const siblings = [...group.querySelectorAll(".js-horizontal-scroll__item")];
            const index = siblings.indexOf(e.target);
            if (index === 0) {
              group.classList.toggle("has-backward", !e.isIntersecting);
            }
            if (index === siblings.length - 1) {
              group.classList.toggle("has-forward", !e.isIntersecting);
            }

            e.target.classList.toggle("is-visible", e.isIntersecting);
          });
        },
        {
          root: list,
          rootMargin: "0px",
          threshold: 0.98, // using 1 causes the false positive occasionally
        }
      );

      const items = [...list.querySelectorAll(".js-horizontal-scroll__item")];
      if (!items.length) return; // no content

      const terminalItems = [...new Set([items[0], items[items.length - 1]])];
      terminalItems.forEach((i) => observer.observe(i));
    });
  }
}
