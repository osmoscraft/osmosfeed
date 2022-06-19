export interface SyndicateCallbacks {
  onConfig: (project: any) => Promise<PipelineFeed>[];
  onFetch: (url: string) => Promise<{ content: string; mediaType: string }>;
  onParse: (input: { content: string; mediaType: string }) => Promise<any>;
  onTransform: (input: any) => Promise<any>;
}

export async function syndicate(
  project: any,
  { onConfig, onFetch, onParse, onTransform }: SyndicateCallbacks
): Promise<PipelineFeed[]> {
  return Promise.all(
    onConfig(project)
      .map((feedAsync) =>
        feedAsync.then(async (feed) =>
          isValid(feed.configResult)
            ? { ...feed, fetchResult: await onFetch(feed.configResult!.url).catch((e) => e as Error) }
            : feed
        )
      )
      .map((feedAsync) =>
        feedAsync.then(async (feed) =>
          isValid(feed.fetchResult)
            ? { ...feed, parseResult: await onParse(feed.fetchResult).catch((e) => e as Error) }
            : feed
        )
      )
      .map((feedAsync) =>
        feedAsync.then(async (feed) =>
          isValid(feed.parseResult)
            ? { ...feed, transformResult: await onTransform(feed).catch((e) => e as Error) }
            : feed
        )
      )
  );
}

/** Ensure a value is defined and it's not error */
function isValid<T>(maybeError?: T | Error): maybeError is T {
  return !!maybeError && !(maybeError instanceof Error);
}

interface PipelineFeed {
  configResult?:
    | Error
    | {
        url: string;
      };
  fetchResult?:
    | Error
    | {
        content: string;
        mediaType: string;
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
