import type { parse } from "@postlight/mercury-parser";

export function ReadingPane() {
  return `<osmos-reading-pane class="c-reading-pane">
    <h1 class="c-reading-pane__title">
      <a href="#">title of the article</a>
    </h1>
    <div class="c-embedded-html"></div>
  </osmos-reading-pane>`;
}

export class ReadingPaneElement extends HTMLElement {
  connectedCallback() {
    const openTriggers = [...document.querySelectorAll<HTMLAnchorElement>(`[data-page-filename]`)];
    openTriggers.forEach((trigger) =>
      trigger.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log("clicked");

        const { pageFilename, pageUrl } = trigger.dataset;
        if (pageFilename && pageUrl) {
          const rawHtml = await (
            await fetch(`data/plugins/@osmosfeed/html-page-crawler/${trigger.dataset.pageFilename}`)
          ).text();
          const parserOutput = await ((window as any).Mercury.parse as typeof parse)(pageUrl, {
            html: rawHtml,
          });
          this.setContent({
            url: pageUrl,
            title: parserOutput.title ?? "Untitled",
            htmlContent: parserOutput.content ?? "No content available",
          });
        }
      })
    );
  }

  setContent(input: { url: string; title: string; htmlContent: string }) {
    const title = this.querySelector<HTMLAnchorElement>("h1 a");
    title!.innerText = input.title;
    title!.href = input.url;
    this.parentElement!.scrollTop = 0;
    this.querySelector("div")!.innerHTML = input.htmlContent;
  }
}
