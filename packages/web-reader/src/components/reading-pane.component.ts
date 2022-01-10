import type { parse } from "@postlight/mercury-parser";
import { RouterElement, RouterState } from "./router.component";

export function ReadingPane() {
  return `<osmos-reading-pane class="c-reading-pane">
    <div class="c-reading-pane__controls js-commands">
      <button data-command="close-reading-pane">&#x2715;</button>
      <button data-command="prev-article">←</button>
      <button data-command="next-article">→</button>
      <button data-command="prev-channel">↑</button>
      <button data-command="next-channel">↓</button>
    </div>
    <h1 class="c-reading-pane__title">
      <a href="#">title of the article</a>
    </h1>
    <div class="c-embedded-html js-html"></div>
  </osmos-reading-pane>`;
}

export class ReadingPaneElement extends HTMLElement {
  private get router() {
    return document.querySelector<RouterElement>("osmos-router")!;
  }

  connectedCallback() {
    this.router.addEventListener("change", async (e) => {
      const state = (e as CustomEvent).detail as RouterState;
      this.handleRouteChange(state);
    });

    this.querySelector(".js-commands")?.addEventListener("click", this.handleCommands);

    // TODO: move to event sources
    const openTriggers = [...document.querySelectorAll<HTMLAnchorElement>(`a[data-page-filename]`)];
    openTriggers.forEach((trigger) =>
      trigger.addEventListener("click", async (e) => {
        e.preventDefault();

        this.router.push({
          pageFilename: trigger.dataset.pageFilename,
          pageUrl: trigger.dataset.pageUrl,
        });
      })
    );
  }

  private handleCommands = (event: Event) => {
    console.log(event);
    const command = ((event.target as HTMLElement)?.closest("[data-command]") as HTMLElement)?.dataset.command;
    switch (command) {
      case "close-reading-pane":
        this.router.push({});
        break;
    }
  };

  private handleRouteChange = async (state: RouterState) => {
    const { pageFilename, pageUrl } = state;
    if (pageFilename && pageUrl) {
      this.setAttribute("data-active", "");
      const rawHtml = await (await fetch(`data/plugins/@osmosfeed/html-page-crawler/${pageFilename}`)).text();
      const parserOutput = await ((window as any).Mercury.parse as typeof parse)(pageUrl, {
        html: rawHtml,
      });
      this.setContent({
        url: pageUrl,
        title: parserOutput.title ?? "Untitled",
        htmlContent: parserOutput.content ?? "No content available",
      });
    } else {
      this.removeAttribute("data-active");
    }
  };

  private setContent = (input: { url: string; title: string; htmlContent: string }) => {
    const title = this.querySelector<HTMLAnchorElement>("h1 a");
    title!.innerText = input.title;
    title!.href = input.url;
    this.parentElement!.scrollTop = 0;
    this.querySelector(".js-html")!.innerHTML = input.htmlContent;
  };
}
