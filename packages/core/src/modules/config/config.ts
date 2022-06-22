import { asError } from "../../utils/error";
import { escapeUnicodeUrl } from "../../utils/url";
import type { PipeFeed, ProjectConfig } from "../types";

export function useInlineConfig(config: ProjectConfig): () => PipeFeed[] {
  return () =>
    config.feeds.map((feed) => {
      try {
        return {
          config: {
            url: escapeUnicodeUrl(feed.url),
          },
        };
      } catch (e) {
        return {
          config: asError(e),
        };
      }
    });
}
