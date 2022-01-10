export function Router() {
  return `<osmos-router></osmos-router>`;
}

export interface RouterState {
  pageFilename?: string;
  pageUrl?: string;
  channelUrl?: string;
}

export class RouterElement extends HTMLElement {
  connectedCallback() {
    window.addEventListener("popstate", (event) =>
      this.dispatchEvent(new CustomEvent("change", { detail: event.state }))
    );
  }

  // TODO prevent duplicated push
  push(state: RouterState) {
    history.pushState(state, "");
    this.dispatchEvent(new CustomEvent("change", { detail: state }));
  }

  replace(state: RouterState) {
    history.replaceState(state, "");
    this.dispatchEvent(new CustomEvent("change", { detail: state }));
  }
}
