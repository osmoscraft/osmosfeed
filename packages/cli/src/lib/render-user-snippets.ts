import type { Config } from "./get-config";
import type { UserSnippet } from "./get-snippets";

export interface RenderHtmlInput {
  baseHtml: string;
  userSnippets: UserSnippet[];
  config: Config;
}

export function renderUserSnippets({ baseHtml, userSnippets: snippets }: RenderHtmlInput): string {
  const customizedTemplate = snippets.reduce(
    (currentTemplate, snippet) => currentTemplate.replace(snippet.replaceFrom, snippet.replaceTo),
    baseHtml
  );

  return customizedTemplate;
}
