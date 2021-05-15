import type { Config } from "./get-config";
import type { UserSnippet } from "./get-user-snippets";

export interface RenderHtmlInput {
  templateOutput: string;
  userSnippets: UserSnippet[];
  config: Config;
}

export function renderUserSnippets({ templateOutput, userSnippets: snippets }: RenderHtmlInput): string {
  const template = templateOutput;

  const customizedTemplate = snippets.reduce(
    (currentTemplate, snippet) => currentTemplate.replace(snippet.replaceFrom, snippet.replaceTo),
    template
  );

  return customizedTemplate;
}
