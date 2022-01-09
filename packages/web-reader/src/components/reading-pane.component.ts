import type { parse } from "@postlight/mercury-parser";

export function ReadingPane() {
  return `<aside>
  <osmos-reading-pane>
    <h1>title of the article</h1>
    <article></article>
  </osmos-reading-pane>
  </aside>`;
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
    this.querySelector("h1")!.innerText = input.title;
    this.querySelector("article")!.innerHTML = input.htmlContent;
  }
}
