import type { JsonFeed } from "./json-feed";

export interface PipeFeed {
  configResult?:
    | Error
    | {
        url: string;
      };
  download?:
    | Error
    | {
        content: string;
        mediaType: string | null;
      };
  parseResult?: Error | JsonFeed;
  transformResult?:
    | Error
    | {
        feed: Record<string, any>;
        items: Record<string, any>[];
      };
}
