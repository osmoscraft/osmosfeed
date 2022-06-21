import type { JsonFeed } from "./json-feed";

export interface PipeFeed {
  config?:
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
  jsonFeed?: Error | JsonFeed;
}
