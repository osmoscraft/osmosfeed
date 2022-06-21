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
  parseResult?:
    | Error
    | {
        feed: Record<string, any>;
        items: Record<string, any>[];
      };
  transformResult?:
    | Error
    | {
        feed: Record<string, any>;
        items: Record<string, any>[];
      };
}
