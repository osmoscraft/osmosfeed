import type { EnrichedArticle, EnrichedSource } from "./enrich";
import type { Config } from "./get-config";
import type { UserSnippet } from "./get-user-snippets";
import { FEED_FILENAME } from "./render-atom";

export interface RenderHtmlInput {
  templateOutput: string;
  userSnippets: UserSnippet[];
  config: Config;
}

const SITE_TITLE_PATTERN = /%SITE_TITLE%/g;
const FEED_FILENAME_PATTERN = /%FEED_FILENAME%/;

interface DisplayDayModel {
  date: string;
  sources: DisplaySource[];
}

interface DisplaySource {
  title: string | null;
  siteUrl: string | null;
  feedUrl: string;
  articles: EnrichedArticle[];
}

export function renderHtml({ templateOutput, userSnippets: snippets, config }: RenderHtmlInput): string {
  const template = templateOutput;
  const hydratedTemplate = template
    .replace(FEED_FILENAME_PATTERN, FEED_FILENAME)
    .replace(SITE_TITLE_PATTERN, config.siteTitle); // TODO use `replaceAll` once we bump github workflow to node v16 LTS

  const customizedTemplate = snippets.reduce(
    (currentTemplate, snippet) => currentTemplate.replace(snippet.replaceFrom, snippet.replaceTo),
    hydratedTemplate
  );

  return customizedTemplate;
}
